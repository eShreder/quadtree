define(function(require) {
    function QTNode(x, y, w, h, depth, maxChildren, maxDepth, root){
        this.init.apply(this, arguments);
    }
    QTNode.prototype.TOP_LEFT = 0;
    QTNode.prototype.TOP_RIGHT = 1;
    QTNode.prototype.BOTTOM_LEFT = 2;
    QTNode.prototype.BOTTOM_RIGHT = 3;
    QTNode.prototype.PARENT = 4;
    QTNode.prototype.init = function(x, y, w, h, depth, maxChildren, maxDepth) {
        this.nodes = [];
        this.items = [];
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.depth = depth;
        this.maxChildren = maxChildren;
        this.maxDepth = maxDepth;
    };
    /**
     * Вставить элемент
     * @param {Object} element
     * */
    QTNode.prototype.insert = function(element) {
        var i;
        if (this.nodes.length) {
            i = this.findInsertNode(element);
            if (i === this.PARENT) {
                this.items.push(element);
            } else {
                this.nodes[i].insert(element);
            }
        } else {
            this.items.push(element);
            if (this.items.length > this.maxChildren && this.depth < this.maxDepth) {
                this.divide();
            }
        }
    };
    /**
     * Поиск места для вставки
     * @param {Object} element
     * */
    QTNode.prototype.findInsertNode = function(element) {
        if (element.x + element.w < this.x + (this.w / 2)) {
            if (element.y + element.h < this.y + (this.h / 2)) {
                return this.TOP_LEFT;
            }
            if (element.y >= this.y + (this.h / 2)) {
                return this.BOTTOM_LEFT;
            }
            return this.PARENT;
        }
        if (element.x >= this.x + (this.w / 2)) {
            if (element.y + element.h < this.y + (this.h / 2)) {
                return this.TOP_RIGHT;
            }
            if (element.y >= this.y + (this.h / 2)) {
                return this.BOTTOM_RIGHT;
            }
            return this.PARENT;
        }
        return this.PARENT;
    };
    /**
     * Разделить узел на части
     * */
    QTNode.prototype.divide = function() {
        var width, oldChildren;
        var childrenDepth = this.depth + 1;
        width = (this.w / 2);
        height = (this.h / 2);
        this.nodes.push(new this.constructor(this.x, this.y, width, height, childrenDepth, this.maxChildren, this.maxDepth, this.root));
        this.nodes.push(new this.constructor(this.x + width, this.y, width, height, childrenDepth, this.maxChildren, this.maxDepth, this.root));
        this.nodes.push(new this.constructor(this.x, this.y + height, width, height, childrenDepth, this.maxChildren, this.maxDepth, this.root));
        this.nodes.push(new this.constructor(this.x + width, this.y + height, width, height, childrenDepth, this.maxChildren, this.maxDepth, this.root));
        oldChildren = this.items;
        this.items = [];
        for (var i = 0, l = oldChildren.length; i < l; i++) {
            this.root.insert(oldChildren[i]);
        }
    };
    /**
     * Удалить все узлы
     * */
    QTNode.prototype.clear = function() {
        for (var i = 0, l = this.nodes.length; i < l; i++) {
            this.nodes[i].clear();
        }
        this.items.length = 0;
        this.nodes.length = 0;
    };
    /**
     * Получить элементы входящие в область element
     * @param {Object} element
     * @param {Array} array
     * @path {String} path
     * */
    QTNode.prototype.retrieve = function(element, array, path) {
        path = path || '';
        for (var i = 0; i < this.items.length; ++i) {
            this.items[i].path = path;
            array.push(this.items[i]);
        }
        if (this.nodes.length) {
            var _this = this;
            this.findOverlappingNodes(element, function(dir) {
                _this.nodes[dir].retrieve(element, array, path + dir);
            });
        }
    };
    /**
     * Поиск следующео узла, пересекающегося с element
     * @param {Object} element
     * @param {Function} fn
     * */
    QTNode.prototype.findOverlappingNodes = function(element, fn) {
        if (element.x < this.x + (this.w / 2)) {
            if (element.y < this.y + (this.h / 2)) {
                fn(this.TOP_LEFT);
            }
            if (element.y + element.h >= this.y + this.h / 2) {
                fn(this.BOTTOM_LEFT);
            }
        }
        if (element.x + element.w >= this.x + (this.w / 2)) {
            if (element.y < this.y + (this.h / 2)) {
                fn(this.TOP_RIGHT);
            }
            if (element.y + element.h >= this.y + this.h / 2) {
                fn(this.BOTTOM_RIGHT);
            }
        }
    };

    QTNode.prototype.getNodes = function() {
        var out = [this];
        for(var i = 0, l = this.nodes.length; i < l; i++) {
            this.nodes[i].getNodes().reduce(function(a, e){
                a.push(e);
                return a;
            }, out);
        }
        return out;
    };


    function QUAD(){
        var self = this;
        self.init = function(args, node) {
            var keys = Object.keys(self.opt);
            for(var i = 0, l = keys.length; i < l; i++) {
                if (args[keys[i]]) {
                    self.opt[keys[i]] = args[keys[i]];
                }
            }
            node = node || QTNode;
            self.root = new node(
                    self.opt.X,
                    self.opt.Y,
                    self.opt.W,
                    self.opt.H,
                    0,
                    self.opt.maxChildren,
                    self.opt.maxDepth);
        };

        /**
         * Вставить элемент в дерево
         * @param {Object} el
         * @return {Object}
         * */
        self.insert = function (el) {
            if (el.y === undefined || el.x === undefined){
                throw(new Error('Item not found option x or y'));
            }
            if (el.center === undefined) {
                el.center = {
                    x: el.x + el.w / 2,
                    y: el.y + el.h / 2
                };
            }
            el.x2 = el.x + el.w;
            el.y2 = el.y + el.h;
            return self.root.insert(el);

        };
        self.retrieve = function(selector, arr) {
            return self.root.retrieve(selector, arr);
        };
        self.clear = function () {
            self.root.clear();
        };
        self.findByPath = function(path) {
            var x = self.opt.X;
            var y = self.opt.Y;
            var w = self.opt.W;
            var h = self.opt.H;
            for(var i = 0, l = path.length; i < l; i++) {
                w = (w / 2);
                h = (h / 2);
                switch(path[i]) {
                    case '0':
                        break;
                    case '1':
                        x += w;
                        break;
                    case '2':
                        y += h;
                        break;
                    case '3':
                        x += w;
                        y += h;
                        break;
                }
            }
            return [x,y,h,w];
        };
        self.getNodes = function() {
            return self.root.getNodes();
        };
    }
    QUAD.prototype = {
        opt: {
            maxChildren: 4,
            maxDepth: 10,
            X: 0,
            Y: 0,
            W: 360,
            H: 180
        }
    };

    return {
        QUAD: QUAD,
        QTNode: QTNode
    };
});
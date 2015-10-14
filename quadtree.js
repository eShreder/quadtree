define(function(require) {
    function QTNode(x, y, w, h, depth, maxChildren, maxDepth) {
        this.nodes = [];
        this.items = [];
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.depth = depth;
        this.maxChildren = maxChildren;
        this.maxDepth = maxDepth;
        //console.log(arguments)
    }
    QTNode.prototype.TOP_LEFT = 0;
    QTNode.prototype.TOP_RIGHT = 1;
    QTNode.prototype.BOTTOM_LEFT = 2;
    QTNode.prototype.BOTTOM_RIGHT = 3;
    QTNode.prototype.PARENT = 4;
    /**
     * Вставить элемент
     * @param {Object} el
     * */
    QTNode.prototype.insert = function(el) {
        var i;
        if (this.nodes.length) {
            i = this.findInsertNode(el);
            if (i === this.PARENT) {
                this.items.push(el);
            } else {
                this.nodes[i].insert(el);
            }
        } else {
            this.items.push(el);
            if (this.items.length > this.maxChildren && this.depth < this.maxDepth) {
                this.divide();
            }
        }
    };
    /**
     * Поиск места для вставки
     * @param {Object} el
     * */
    QTNode.prototype.findInsertNode = function(el) {
        if (el.x + el.w < this.x + (this.w / 2)) {
            if (el.y + el.h < this.y + (this.h / 2)) {
                return this.TOP_LEFT;
            }
            if (el.y >= this.y + (this.h / 2)) {
                return this.BOTTOM_LEFT;
            }
            return this.PARENT;
        }
        if (el.x >= this.x + (this.w / 2)) {
            if (el.y + el.h < this.y + (this.h / 2)) {
                return this.TOP_RIGHT;
            }
            if (el.y >= this.y + (this.h / 2)) {
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
        var width, height, i, oldChildren;
        var childrenDepth = this.depth + 1;
        width = (this.w / 2);
        height = (this.h / 2);
        this.nodes.push(new QTNode(this.x, this.y, width, height, childrenDepth, this.maxChildren, this.maxDepth));
        this.nodes.push(new QTNode(this.x + width, this.y, width, height, childrenDepth, this.maxChildren, this.maxDepth));
        this.nodes.push(new QTNode(this.x, this.y + height, width, height, childrenDepth, this.maxChildren, this.maxDepth));
        this.nodes.push(new QTNode(this.x + width, this.y + height, width, height, childrenDepth, this.maxChildren, this.maxDepth));
        oldChildren = this.items;
        this.items = [];
        for (i = 0, l = oldChildren.length; i < l; i++) {
            this.insert(oldChildren[i]);
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
    QTNode.prototype.retrieve = function(el, a, path) {
        path = path || '';
        for (var i = 0; i < this.items.length; ++i) {
            this.items[i].path = path;
            a.push(this.items[i]);
        }
        if (this.nodes.length) {
            var _this = this;
            this.findOverlappingNodes(el, function(dir) {
                _this.nodes[dir].retrieve(el, a, path + dir);
            });
        }
    };
    QTNode.prototype.findOverlappingNodes = function(el, cb) {
        if (el.x < this.x + (this.w / 2)) {
            if (el.y < this.y + (this.h / 2)) {
                cb(this.TOP_LEFT);
            }
            if (el.y + el.h >= this.y + this.h / 2) {
                cb(this.BOTTOM_LEFT);
            }
        }
        if (el.x + el.w >= this.x + (this.w / 2)) {
            if (el.y < this.y + (this.h / 2)) {
                cb(this.TOP_RIGHT);
            }
            if (el.y + el.h >= this.y + this.h / 2) {
                cb(this.BOTTOM_RIGHT);
            }
        }
    };


    function QUAD(){
        var self = this;
        self.init = function(args) {
            var keys = Object.keys(self.opt);
            for(var i = 0, l = keys.length; i < l; i++) {
                if (args[keys[i]]) {
                    self.opt[keys[i]] = args[keys[i]];
                }
            }
            self.root = new QTNode(
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
         * @param {Boolean} merge false, true - сливать точки в одне
         * @return {Object}
         * */
        self.insert = function (el, merge) {
            if (el.y === undefined || el.x === undefined){
                throw(new Error('Item not found option x or y'));
            }
            //if (!!merge) {
                //return self.root.insertWithMerge(el);
            //} else {
                return self.root.insert(el);
            //}
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
        }
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

    return QUAD;
});
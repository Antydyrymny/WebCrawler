class InnerNode {
    constructor(url) {
        this.url = url;
        this.inner = true;
        this.connections = new Map();
        this.explored = false;
    }

    connect(node) {
        if (!this.connections.has(node)) this.connections.set(node, 1);
        else this.connections.set(node, this.connections.get(node) + 1);
    }
}

class OuterNode {
    constructor(url) {
        this.url = url;
        this.inner = false;
        this.explored = false;
    }
}

export { InnerNode, OuterNode };

define(function () {
    
    function DependencyTracker() {
        this.observers = [];

        this.push = function (observer) {
            this.observers.push(observer);
            return this;
        };

        this.pop = function () {
            this.observers.pop();
            return this;
        };

        this.notify = function (changedProperty) {
            if (this.observers.length > 0) {
                this.observers[this.observers.length - 1](changedProperty);
            }
            return this;
        };
    }
    
    return new DependencyTracker();
});
module("bindings");

test("can create a binding", function () {
    var element = $('<span/>'),
    obj = {},
    binding = just.binding(element, obj);

    ok(binding);
});

test("can bind data-class attribute to object property", function() {
	var element = $('<span data-class="this.clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);

    equal(element.className, "test");
});

test("can bind data-class attribute to object value", function() {
	var element = $('<span data-class="this.clazz"/>')[0],
    obj = {
        clazz: "test"
    },
    binding = just.binding(element, obj);

    equal(element.className, "test");
});

test("updating object property updates binding", function() {
    var element = $('<span data-class="this.clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);
	
    obj.clazz("test2");

    equal(element.className, "test2");
});

test("can bind data-title", function() {
	var element = $('<span data-title="this.title"/>')[0],
    obj = {
        title: just.property("test")
    },
    binding = just.binding(element, obj);

    equal(element.title, "test");
});

test("can bind two data attributes", function() {
	var element = $('<span data-title="this.title" data-class="this.clazz"/>')[0],
    obj = {
	    title: just.property("title1"),
	    clazz: just.property("class1")
    },
    binding = just.binding(element, obj);
	
    equal(element.title, "title1");
    equal(element.className, "class1");
});

test("can bind two data attributes and update them", function() {
	var element = $('<span data-title="this.title" data-class="this.clazz"/>')[0],
	obj = {
	    title: just.property("title1"),
	    clazz: just.property("class1")
    },
    binding = just.binding(element, obj);
	
    obj.title("title2");
    obj.clazz("class2");
	
    equal(element.title, "title2");
    equal(element.className, "class2");
});

test("data-class binding preserves existing classes", function() {
    var element = $('<span class="existing1 existing2" data-class="this.clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);

    obj.clazz("test2");

    equal(element.className, "existing1 existing2 test2");
});

test("data-text binding updates Text node", function() {
    var element = $('<span data-text="this.name"></span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text", function() {
    var element = $('<span data-text="this.name">Sheldon</span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text and elements", function() {
    var element = $('<span data-text="this.name">Sheldon<div>Cooper</div></span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-id binding updates element id", function() {
	var element = $('<span data-id="this.id"/>')[0],
    obj = {
        id: just.property("123")
    },
    binding = just.binding(element, obj);

    equal(element.id, "123");
});

test("data-onclick binds to a function", function() {
	var element = $('<span data-onclick="this.clickHandler"/>')[0],
	called = false,
    obj = {
        clickHandler: function() {
        	called = true;
        }
    },
    binding = just.binding(element, obj);

	element.click();
	
    ok(called);
});

test("data-onclick binds to a function property", function() {
	var element = $('<span data-onclick="this.clickHandler"/>')[0],
	called = false,
	calledWithThis,
	calledWithEvent,
    obj = {
        clickHandler: just.property(function(event) {
        	called = true;
        	calledWithThis = this;
        	calledWithEvent = event;
        })
    },
    binding = just.binding(element, obj);

	element.click();
	
    ok(called);
    equal(calledWithThis, obj);
    ok(calledWithEvent instanceof MouseEvent);
});

test("data-onclick binding can be changed to a different function", function() {
	var element = $('<span data-onclick="this.clickHandler"/>')[0],
	called1 = false,
	called2 = false,
    obj = {
        clickHandler: just.property(function() {
        	called1 = true;
        })
    },
    binding = just.binding(element, obj);

	obj.clickHandler(function() {
		called2 = true;
	});
	
	element.click();
	
    ok(!called1);
    ok(called2);
});

test("data-element binds element", function() {
	var element = $('<span data-element="this.el"/>')[0],
	childElement = $('<div/>')[0],
    obj = {
        el: just.property(childElement)
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
	equal(element.childNodes[0], childElement);
});

test("data-text binding updates Text node", function() {
    var element = $('<span data-text="this.person().name()"></span>')[0],
    obj = {
    	person: just.property({
    		name: just.property("Raj")
    	}) 
    },
    binding = just.binding(element, obj);

    equal(element.childNodes[0].textContent, "Raj");
});

test("data-value binding updates input text value", function() {
    var element = $('<input type="text" data-value="this.name()"/>')[0],
    obj = {
        name: just.property("Raj") 
    },
    binding = just.binding(element, obj);

    equal(element.value, "Raj");
});

test("data-value binding updates property when input text value changes", function() {
    var element = $('<input type="text" data-value="this.name"/>')[0],
    obj = {
        name: just.property("") 
    },
    binding = just.binding(element, obj);

    element.value = "Raj";
    element.onchange();
    
    equal(obj.name(), "Raj");
});

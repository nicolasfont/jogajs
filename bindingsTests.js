module("bindings");

test("can create a binding", function () {
    var element = $('<span/>'),
    obj = {},
    binding = just.binding(element, obj);

    ok(binding);
});

test("can bind data-class attribute to object property", function() {
	var element = $('<span data-class="clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);

    equal(element.className, "test");
});

test("updating object property updates binding", function() {
    var element = $('<span data-class="clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);
	
    obj.clazz("test2");

    equal(element.className, "test2");
});

test("can bind data-title", function() {
	var element = $('<span data-title="title"/>')[0],
    obj = {
        title: just.property("test")
    },
    binding = just.binding(element, obj);

    equal(element.title, "test");
});

test("can bind two data attributes", function() {
	var element = $('<span data-title="title" data-class="clazz"/>')[0],
    obj = {
	    title: just.property("title1"),
	    clazz: just.property("class1")
    },
    binding = just.binding(element, obj);
	
    equal(element.title, "title1");
    equal(element.className, "class1");
});

test("can bind two data attributes and update them", function() {
	var element = $('<span data-title="title" data-class="clazz"/>')[0],
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
    var element = $('<span class="existing1 existing2" data-class="clazz"/>')[0],
    obj = {
        clazz: just.property("test")
    },
    binding = just.binding(element, obj);

    obj.clazz("test2");

    equal(element.className, "existing1 existing2 test2");
});

test("data-text binding updates Text node", function() {
    var element = $('<span data-text="name"></span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text", function() {
    var element = $('<span data-text="name">Sheldon</span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});

test("data-text binding updates Text node overwriting existing text and elements", function() {
    var element = $('<span data-text="name">Sheldon<div>Cooper</div></span>')[0],
    obj = {
        name: just.property("Raj")
    },
    binding = just.binding(element, obj);

    equal(element.childNodes.length, 1);
    equal(element.childNodes[0].textContent, "Raj");
});
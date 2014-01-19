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
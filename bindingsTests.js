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
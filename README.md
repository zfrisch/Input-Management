
An Extensible DOM "Library" For Managing Inputs and their Values
It’s a small Input Management that does the following:

From any Container(`form, div, section, or even the document.body`) render an object that allows easy access to the most important values. 

This is done through the method `getChildInputValues` which is accessible from all HTML Elements.

Example:

    let container = document.getElementById("myContainer");
    let inputObject = container.getChildInputValues(); 

Using the above object you can use the methods:

 - `InputObject.getByName(name),` 
 - `InputObject.getByID(id)`
 - `InputObject.getByText(text)`
 - `InputObject.getByType(type)`
 - `InputObject.getByValue(value)`
 -  `InputObject.getByData(dataProp,[ dataVal ])`
 - `InputObject.getByGroup(group_name)`
 - `InputObject.getByClass(class_name)`

 to return a specific input object containing what you need. This means that every single object will have a value and that value is the most important.
 
 List of Important Values
 ![enter image description here](https://cdn-images-1.medium.com/max/800/1*01dJZ_pETVzBHm_Tl-F1OQ.png)

**Note:** getByGroup will return an object that contains the **_selected_** value of the radio group.

There is also an iterable array of input objects that you can access underneath the property 
`InputObj.fields` 

Each object in `fields` contains data pertinent to that field. They are mostly similar but there are some notable differences.

This is an example of a `text`, `color`, or `date` object:

             {
               class: this.className,
               data: element.dataset || null,
               value: element.value,
               name: element.name,
               text: element.textContent || "",
               tag: element.tagName,
               type: element.type,
               id: element.id || null,
               ele: DOM element reference
              }

This is an example of a `checkbox` object:

        {
          class: this.className,
          data: element.dataset || null,
          value: element.checked,
          checked: element.checked,
          name: element.name,
          text: element.textContent || "",
          tag: element.tagName,
          type: element.type,
          id: element.id || null,
          ele: DOM element reference
        }

This is an example of a `radio` object:

                {
                  class: this.className,
                  data: element.dataset || null,
                  isSelected: element.checked,
                  getSelected(): returns selected radio in group || undefined 
                  value: returns selected radio in group' value || undefined
                  checked: element.checked,
                  name: element.name,
                  text: element.textContent || "",
                  tag: element.tagName,
                  type: element.type,
                  id: element.id || null,
                  ele: DOM element reference
                }


This is an example of a `Textarea` object:

            {
              class: this.className,
              data: element.dataset || null,
              value: element.value,
              name: element.name,
              text: element.textContent || "",
              tag: element.tagName,
              id: element.id || null,
              ele: DOM element Reference
            }
            
This is an example of a `Select` object:

            {
              class: this.className,
              data: element.dataset || null,
              value: element.value,
              name: element.name,
              text: element.options[this.selectedIndex].textContent,
              tag: element.tagName,
              id: element.id || null,
              ele: DOM element Reference
            }

**Note** This data is not live. When any updates occur you will have to call `getChildInputValues` for updated information. Additionally DOM references are broken when stored into a JSON String and reinflated.

Any input that is grabbed from the Container is automatically setup into an easy-to-store JSON String, aptly underneath the property 
`InputObj.storable`

This can be sent out with an XHR request, stored in Client Storage, or simply kept on-hand as easily accessible data.

    // storing all inputs and their values in storage
    let container = document.getElementById("container");
    let InputObject = container.getInputChildValues(); 
    localStorage.setItem("form", InputObject.storable);
    
Saving form data like this is great but what’s more important is that you can load this data from storage very easily using the method `renderUsingInput` on any Container.

    // getting all values and rendering them
    let container = document.getElementById("container);
    let RetrievedInput = localStorage.getItem("form");
    container.renderUsingInput(RetrievedInput);

If the Container holds the same nodes as the data acquired when it was saved it will automatically populate with the data that it has on hand.

If the form you are saving is constantly re-rendering and any of the information within the Container's nodes change(*name, id, data attributes, etc*) you will have to designate **at least one _UNIQUE_ value** of which to determine the node to render to.

For instance if we have HTML that initially appears like this:

       <div id="container">
        <input type="text" name="First Name" id="textbox1">
        </div>  

and we save the data into our `InputObject`:

    let container = document.getElementById("container");
    let InputObject = container.getChildInputValues();
Assuming immediately afterwards the Container is re-rendered with a changed property, like this:

    <div id="container">
    <input type="text" name="First Name" id="myNewId">
    </div>
   The library will not be able to build the appropriate selector to know what element to grab and render input to.  `container.renderUsingInput(InputObject.storable)` will fail. 

You can get around this by passing an Options Object as the secondary parameter to `renderUsingInput` and supplying the selector that the library _should_ look for instead of trying to build it's own from the collected data.

    container.renderUsingInput(InputObject.storable, { 
     selector: function(field) { 
       if(field.name === "First Name") {
         return `[name="${field.name}"]`;
       }
     }
    }

The above will always render the information from any field with the name `First Name` to a field that matches the selector `[name="First Name"]`

In this example all other selectors will automatically fall through and not render. If you would like to change this you can set the property `selectorFallback` to true within the Options Object

    container.renderUsingInput(InputObject.storable, {
    selectorFallback: true, 
     selector: function(field) { 
       if(field.name === "First Name") {
         return `[name="${field.name}"]`;
       }
     }
    }
This means that every selector, if it doesn't return a selector from the specified `selector` parameter, will be built using a default process that uses the data stored within the `InputObject`. 

**Note**	There is a fail-safe built into the method that will not allow a node to be rendered more than once. This means that if you write a `selector` that finds a specific node, and a  `fallback` selector finds the same node, it will not be rendered twice and instead will be disregarded. This will _not_ throw an error. 

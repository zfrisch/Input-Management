// input management
( function InputManagement_() {
  ( HTMLElement.prototype.renderUsingInput = function( input, options = {} ) {
    if ( !input ) throw Error( "invalid input" );
    try {
      input = JSON.parse( input );
    } catch ( e ) {
      throw Error( "invalid input" );
    }
    let selector = "";
    let previousNodes = [];

    function alreadySelected( node ) {
      let flag = false;
      if ( !node ) return true;
      for ( let c_node of previousNodes ) {
        if ( node )
          if ( node.isSameNode( c_node ) ) flag = true;
      }
      return flag;
    }
    for ( let field of input ) {
      if ( options.selector ) {
        selector = options.selector( field );
        if ( selector == "" || selector == undefined ) {
          if ( options.selectorFallback ) selector = defaultSelector( selector );
        }
      } else {
        selector = defaultSelector( selector );
      }

      function defaultSelector( selector ) {
        ( selector = field.tag );
        ( selector += field.data ? selectorData( field.data ) : "" );
        ( selector += field.id ? "#" + field.id : "" );
        ( selector += field.name ? "[name='" + field.name + "']" : "" );
        ( selector += field.type ? "[type='" + field.type + "']" : "" );
        return selector;
      }

      function selectorData( data, selector = "" ) {
        Object.getOwnPropertyNames( data ).forEach( name => selector += `[data-${name}='${data[name]}']` );
        return selector;
      }
      if ( !selector ) break;
      let eles = document.querySelectorAll( selector ),
        retrieved = eles[ 0 ];
      if ( eles.length > 1 && field.type === "radio" ) {
        selector += "[value='" + field.value + "']";
        retrieved = document.querySelector( selector );
        if ( alreadySelected( retrieved ) ) continue;
        if ( field.isSelected ) retrieved.checked = true;
        else retrieved.checked = false;
        previousNodes.push( retrieved );
      } else if ( field.type === "checkbox" ) {
        if ( alreadySelected( retrieved ) ) continue;
        retrieved.checked = field.value;
        previousNodes.push( retrieved );
      } else {
        if ( alreadySelected( retrieved ) ) continue;
        retrieved.value = field.value;
        previousNodes.push( retrieved );
      }
    }
    this.querySelectorAll( "input, select, textarea" ).forEach( ele => {} );
  } ), ( HTMLElement.prototype.getChildInputValues = function() {
    let container = this;
    let objectArray = [];
    this.querySelectorAll( "input, select, textarea" ).forEach( ele => {
      let props = ele.getProps( container );
      if ( props ) objectArray.push( props );
    } );
    return {
      fields: objectArray,
      storable: JSON.stringify( objectArray ),
      renderAll() {},
      getBy( prop, value ) {
        let result = objectArray.filter( ele => ele[ prop ] === value );
        return ( result[ 0 ] || {
          value: undefined
        } );
      },
      getData( dataProp ) {
        let result = objectArray.filter( ele => ele.data );
        result = result.filter( ele => ele.data[ dataProp ] );
        return ( result || {
          value: undefined
        } );
      },
      getGroup( groupName ) {
        let result = objectArray.filter( ele => ele.name === groupName );
        result = result.filter( ele => ele.isSelected );
        return ( result[ 0 ] || {
          value: undefined
        } );
      },
      getByName( name ) {
        return this.getBy( "name", name );
      },
      getByID( id ) {
        return this.getBy( "id", id );
      },
      getByText( txt ) {
        return this.getBy( "text", txt );
      },
      getByType( type ) {
        return this.getBy( "type", type );
      },
      getByValue( value ) {
        return this.getBy( "value", value );
      },
      getByGroup( groupName ) {
        return this.getGroup( groupName );
      },
      getByData( dataProp, dataVal ) {
        if ( !dataVal ) return this.getData( dataProp );
        return this.getData( dataProp ).filter( ele => ele.data[ dataProp ] === dataVal );
      }
    };
  } );
  HTMLInputElement.prototype.getProps = HTMLSelectElement.prototype.getProps = HTMLTextAreaElement.prototype.getProps = function( container ) {
    switch ( this.tagName ) {
      case "SELECT":
        return {
          data: this.dataset || null,
          value: this.value,
          name: this.name,
          text: this.options[ this.selectedIndex ].textContent,
          tag: this.tagName,
          id: this.id || null,
          ele: this
        };
        break;
      case "TEXTAREA":
        return {
          data: this.dataset || null,
          value: this.value,
          name: this.name,
          text: this.textContent || "",
          tag: this.tagName,
          id: this.id || null,
          ele: this
        };
      case "INPUT":
        switch ( this.type ) {
          case "date":
          case "color":
          case "text":
            return {
              data: this.dataset || null,
              value: this.value,
              name: this.name,
              text: this.textContent || "",
              tag: this.tagName,
              type: this.type,
              id: this.id || null,
              ele: this
            };
            break;
          case "checkbox":
            return {
              data: this.dataset || null,
              value: this.checked,
              checked: this.checked,
              name: this.name,
              text: this.textContent || "",
              tag: this.tagName,
              type: this.type,
              id: this.id || null,
              ele: this
            };
            break;
          case "radio":
            let checked = container.querySelector( "input[name='" + this.name + "']:checked" );
            let amichecked = this.checked;
            return {
              data: this.dataset || null,
              isSelected: amichecked,
              getSelected() {
                return checked ? checked : false;
              },
              value: checked ? checked.value : undefined,
              ele: this,
              checked: this.checked,
              name: this.name,
              text: this.textContent || "",
              tag: this.tagName,
              type: this.type,
              id: this.id || null,
              ele: this
            };
            break;
        }
    }
  };
} )();
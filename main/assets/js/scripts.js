// Utility function
function Util () {};

/* class manipulation functions */
Util.hasClass = function(el, className) {
	return el.classList.contains(className);
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	el.classList.add(classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	el.classList.remove(classList[0]);	
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* DOM manipulation */
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length;

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* Animate height of an element */
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* Smooth Scroll */
Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* Move Focus */
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* Misc */

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* Animation curves */
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if( menuBtns.length > 0 ) {
      for(var i = 0; i < menuBtns.length; i++) {(function(i){
        initMenuBtn(menuBtns[i]);
      })(i);}
  
      function initMenuBtn(btn) {
        btn.addEventListener('click', function(event){	
          event.preventDefault();
          var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
          Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
          // emit custom event
          var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
          btn.dispatchEvent(event);
        });
      };
    }
  }());
// File#: _2_autocomplete
// Usage: codyhouse.co/license
(function() {
    var Autocomplete = function(opts) {
      if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
      this.options = Util.extend(Autocomplete.defaults, opts);
      this.element = this.options.element;
      this.input = this.element.getElementsByClassName('js-autocomplete__input')[0];
      this.results = this.element.getElementsByClassName('js-autocomplete__results')[0];
      this.resultsList = this.results.getElementsByClassName('js-autocomplete__list')[0];
      this.ariaResult = this.element.getElementsByClassName('js-autocomplete__aria-results');
      this.resultClassName = this.element.getElementsByClassName('js-autocomplete__item').length > 0 ? 'js-autocomplete__item' : 'js-autocomplete__result';
      // store search info
      this.inputVal = '';
      this.typeId = false;
      this.searching = false;
      this.searchingClass = this.element.getAttribute('data-autocomplete-searching-class') || 'autocomplete--searching';
      // dropdown reveal class
      this.dropdownActiveClass =  this.element.getAttribute('data-autocomplete-dropdown-visible-class') || this.element.getAttribute('data-dropdown-active-class');
      // truncate dropdown
      this.truncateDropdown = this.element.getAttribute('data-autocomplete-dropdown-truncate') && this.element.getAttribute('data-autocomplete-dropdown-truncate') == 'on' ? true : false;
      initAutocomplete(this);
      this.autocompleteClosed = false; // fix issue when selecting an option from the list
    };
  
    function initAutocomplete(element) {
      initAutocompleteAria(element); // set aria attributes for SR and keyboard users
      initAutocompleteTemplates(element);
      initAutocompleteEvents(element);
    };
  
    function initAutocompleteAria(element) {
      // set aria attributes for input element
      Util.setAttributes(element.input, {'role': 'combobox', 'aria-autocomplete': 'list'});
      var listId = element.resultsList.getAttribute('id');
      if(listId) element.input.setAttribute('aria-owns', listId);
      // set aria attributes for autocomplete list
      element.resultsList.setAttribute('role', 'list');
    };
  
    function initAutocompleteTemplates(element) {
      element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[data-autocomplete-template]');
      if(element.templateItems.length < 1) element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName);
      element.templates = [];
      for(var i = 0; i < element.templateItems.length; i++) {
        element.templates[i] = element.templateItems[i].getAttribute('data-autocomplete-template');
      }
    };
  
    function initAutocompleteEvents(element) {
      // input - keyboard navigation 
      element.input.addEventListener('keyup', function(event){
        handleInputTyped(element, event);
      });
  
      // if input type="search" -> detect when clicking on 'x' to clear input
      element.input.addEventListener('search', function(event){
        updateSearch(element);
      });
  
      // make sure dropdown is open on click
      element.input.addEventListener('click', function(event){
        updateSearch(element, true);
      });
  
      element.input.addEventListener('focus', function(event){
        if(element.autocompleteClosed) {
          element.autocompleteClosed = false;
          return;
        }
        updateSearch(element, true);
      });
  
      // input loses focus -> close menu
      element.input.addEventListener('blur', function(event){
        checkFocusLost(element, event);
      });
  
      // results list - keyboard navigation 
      element.resultsList.addEventListener('keydown', function(event){
        navigateList(element, event);
      });
  
      // results list loses focus -> close menu
      element.resultsList.addEventListener('focusout', function(event){
        checkFocusLost(element, event);
      });
  
      // close on esc
      window.addEventListener('keyup', function(event){
        if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
          toggleOptionsList(element, false);
        } else if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') { // on Enter - select result if focus is within results list
          selectResult(element, document.activeElement.closest('.'+element.resultClassName), event);
        }
      });
  
      // select element from list
      element.resultsList.addEventListener('click', function(event){
        selectResult(element, event.target.closest('.'+element.resultClassName), event);
      });
    };
  
    function checkFocusLost(element, event) {
      if(element.element.contains(event.relatedTarget)) return;
      toggleOptionsList(element, false);
    };
  
    function handleInputTyped(element, event) {
      if(event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40') {
        moveFocusToList(element);
      } else {
        updateSearch(element);
      }
    };
  
    function moveFocusToList(element) {
      if(!Util.hasClass(element.element, element.dropdownActiveClass)) return;
      resetSearch(element); // clearTimeout
      // make sure first element is focusable
      var index = 0;
      if(!elementListIsFocusable(element.resultsItems[index])) {
        index = getElementFocusbleIndex(element, index, true);
      }
      getListFocusableEl(element.resultsItems[index]).focus();
    };
  
    function updateSearch(element, bool) {
      var inputValue = element.input.value;
      if(inputValue == element.inputVal && !bool) return; // input value did not change
      element.inputVal = inputValue;
      if(element.typeId) clearInterval(element.typeId); // clearTimeout
      if(element.inputVal.length < element.options.characters) { // not enough characters to start searching
        toggleOptionsList(element, false);
        return;
      }
      if(bool) { // on focus -> update result list without waiting for the debounce
        updateResultsList(element, 'focus');
        return;
      }
      element.typeId = setTimeout(function(){
        updateResultsList(element, 'type');
      }, element.options.debounce);
    };
  
    function toggleOptionsList(element, bool) {
      // toggle visibility of options list
      if(bool) {
        if(Util.hasClass(element.element, element.dropdownActiveClass)) return;
        Util.addClass(element.element, element.dropdownActiveClass);
        element.input.setAttribute('aria-expanded', true);
        truncateAutocompleteList(element);
      } else {
        if(!Util.hasClass(element.element, element.dropdownActiveClass)) return;
        if(element.resultsList.contains(document.activeElement)) {
          element.autocompleteClosed = true;
          element.input.focus();
        }
        Util.removeClass(element.element, element.dropdownActiveClass);
        element.input.removeAttribute('aria-expanded');
        resetSearch(element); // clearTimeout
      }
    };
  
    function truncateAutocompleteList(element) {
      if(!element.truncateDropdown) return;
      // reset max height
      element.resultsList.style.maxHeight = '';
      // check available space 
      var spaceBelow = (window.innerHeight - element.input.getBoundingClientRect().bottom - 10),
        maxHeight = parseInt(getComputedStyle(element.resultsList).maxHeight);
  
      (maxHeight > spaceBelow) 
        ? element.resultsList.style.maxHeight = spaceBelow+'px' 
        : element.resultsList.style.maxHeight = '';
    };
  
    function updateResultsList(element, eventType) {
      if(element.searching) return;
      element.searching = true;
      Util.addClass(element.element, element.searchingClass); // show loader
      element.options.searchData(element.inputVal, function(data, cb){
        // data = custom results
        populateResults(element, data, cb);
        Util.removeClass(element.element, element.searchingClass);
        toggleOptionsList(element, true);
        updateAriaRegion(element);
        element.searching = false;
      }, eventType);
    };
  
    function updateAriaRegion(element) {
      element.resultsItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[tabindex="-1"]');
      if(element.ariaResult.length == 0) return;
      element.ariaResult[0].textContent = element.resultsItems.length;
    };
  
    function resetSearch(element) {
      if(element.typeId) clearInterval(element.typeId);
      element.typeId = false;
    };
  
    function navigateList(element, event) {
      var downArrow = (event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40'),
        upArrow = (event.key.toLowerCase() == 'arrowup' || event.keyCode == '38');
      if(!downArrow && !upArrow) return;
      event.preventDefault();
      var selectedElement = document.activeElement.closest('.'+element.resultClassName) || document.activeElement;
      var index = Util.getIndexInArray(element.resultsItems, selectedElement);
      var newIndex = getElementFocusbleIndex(element, index, downArrow);
      getListFocusableEl(element.resultsItems[newIndex]).focus();
    };
  
    function getElementFocusbleIndex(element, index, nextItem) {
      var newIndex = nextItem ? index + 1 : index - 1;
      if(newIndex < 0) newIndex = element.resultsItems.length - 1;
      if(newIndex >= element.resultsItems.length) newIndex = 0;
      // check if element can be focused
      if(!elementListIsFocusable(element.resultsItems[newIndex])) {
        // skip this element
        return getElementFocusbleIndex(element, newIndex, nextItem);
      }
      return newIndex;
    };
  
    function elementListIsFocusable(item) {
      var role = item.getAttribute('role');
      if(role && role == 'presentation') {
        // skip this element
        return false;
      }
      return true;
    };
  
    function getListFocusableEl(item) {
      var newFocus = item,
        focusable = newFocus.querySelectorAll('button:not([disabled]), [href]');
      if(focusable.length > 0 ) newFocus = focusable[0];
      return newFocus;
    };
  
    function selectResult(element, result, event) {
      if(!result) return;
      if(element.options.onClick) {
        element.options.onClick(result, element, event, function(){
          toggleOptionsList(element, false);
        });
      } else {
        element.input.value = getResultContent(result);
        toggleOptionsList(element, false);
      }
      element.inputVal = element.input.value;
    };
  
    function getResultContent(result) { // get text content of selected item
      var labelElement = result.querySelector('[data-autocomplete-label]');
      return labelElement ? labelElement.textContent : result.textContent;
    };
  
    function populateResults(element, data, cb) {
      var innerHtml = '';
  
      for(var i = 0; i < data.length; i++) {
        innerHtml = innerHtml + getItemHtml(element, data[i]);
      }
      if(element.options.populate) element.resultsList.innerHTML = innerHtml;
      else if(cb) cb(innerHtml);
    };
  
    function getItemHtml(element, data) {
      var clone = getClone(element, data);
      Util.removeClass(clone, 'is-hidden');
      clone.setAttribute('tabindex', '-1');
      for(var key in data) {
        if (data.hasOwnProperty(key)) {
          if(key == 'label') setLabel(clone, data[key]);
          else if(key == 'class') setClass(clone, data[key]);
          else if(key == 'url') setUrl(clone, data[key]);
          else if(key == 'src') setSrc(clone, data[key]);
          else setKey(clone, key, data[key]);
        }
      }
      return clone.outerHTML;
    };
  
    function getClone(element, data) {
      var item = false;
      if(element.templateItems.length == 1 || !data['template']) item = element.templateItems[0];
      else {
        for(var i = 0; i < element.templateItems.length; i++) {
          if(data['template'] == element.templates[i]) {
            item = element.templateItems[i];
          }
        }
        if(!item) item = element.templateItems[0];
      }
      return item.cloneNode(true);
    };
  
    function setLabel(clone, label) {
      var labelElement = clone.querySelector('[data-autocomplete-label]');
      labelElement 
        ? labelElement.textContent = label
        : clone.textContent = label;
    };
  
    function setClass(clone, classList) {
      Util.addClass(clone, classList);
    };
  
    function setUrl(clone, url) {
      var linkElement = clone.querySelector('[data-autocomplete-url]');
      if(linkElement) linkElement.setAttribute('href', url);
    };
  
    function setSrc(clone, src) {
      var imgElement = clone.querySelector('[data-autocomplete-src]');
      if(imgElement) imgElement.setAttribute('src', src);
    };
  
    function setKey(clone, key, value) {
      var subElement = clone.querySelector('[data-autocomplete-'+key+']');
      if(subElement) {
        if(subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value;
        else subElement.textContent = value;
      }
    };
  
    Autocomplete.defaults = {
      element : '',
      debounce: 200,
      characters: 2,
      populate: true,
      searchData: false, // function used to return results
      onClick: false // function executed when selecting an item in the list; arguments (result, obj) -> selected <li> item + Autocompletr obj reference
    };
  
    window.Autocomplete = Autocomplete;
  }());
// File#: _3_drop-menu
// Usage: codyhouse.co/license
(function() {
    var DropMenu = function(element) {
      this.element = element;
      this.innerElement = this.element.getElementsByClassName('js-drop-menu__inner');
      this.trigger = document.querySelector('[aria-controls="'+this.element.getAttribute('id')+'"]');
      this.autocompleteInput = false;
      this.autocompleteList = false;
      this.animationDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--drop-menu-transition-duration')) || 0.3;
      // store some basic classes
      this.menuIsVisibleClass = 'drop-menu--is-visible';
      this.menuLevelClass = 'js-drop-menu__list';
      this.menuBtnInClass = 'js-drop-menu__btn--sublist-control';
      this.menuBtnOutClass = 'js-drop-menu__btn--back';
      this.levelInClass = 'drop-menu__list--in';
      this.levelOutClass = 'drop-menu__list--out';
      // store the max height of the element
      this.maxHeight = false;
      // store drop menu layout 
      this.layout = false;
      // vertical gap - desktop layout
      this.verticalGap = parseInt(getComputedStyle(this.element).getPropertyValue('--drop-menu-gap-y')) || 4;
      // store autocomplete search results
      this.searchResults = [];
      // focusable elements
      this.focusableElements = [];
      initDropMenu(this);
    };
  
    function initDropMenu(menu) {
      // trigger drop menu opening/closing
      toggleDropMenu(menu);
      // toggle sublevels
      menu.element.addEventListener('click', function(event){
        // check if we need to show a new sublevel
        var menuBtnIn = event.target.closest('.'+menu.menuBtnInClass);
        if(menuBtnIn) showSubLevel(menu, menuBtnIn);
        // check if we need to go back to a previous level
        var menuBtnOut = event.target.closest('.'+menu.menuBtnOutClass);
        if(menuBtnOut) hideSubLevel(menu, menuBtnOut);
      });
      // init automplete search
      initAutocomplete(menu);
      // close drop menu on focus out
      initFocusOut(menu);
    };
  
    function toggleDropMenu(menu) { // toggle drop menu
      if(!menu.trigger) return;
      // actions to be performed when closing the drop menu
      menu.dropMenuClosed = function(event) {
        if(event.propertyName != 'visibility') return;
        if(getComputedStyle(menu.element).getPropertyValue('visibility') != 'hidden') return;
        menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
        menu.element.removeAttribute('style');
        resetAllLevels(menu); // go back to main list
        resetAutocomplete(menu); // if autocomplte is enabled -> reset input fields
      };
  
      // on mobile - close drop menu when clicking on close btn
      menu.element.addEventListener('click', function(event){
        var target = event.target.closest('.js-drop-menu__close-btn');
        if(!target || !dropMenuVisible(menu)) return;
        menu.trigger.click();
      });
  
      // click on trigger
      menu.trigger.addEventListener('click', function(event){
        menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
        var isVisible = dropMenuVisible(menu);
        Util.toggleClass(menu.element, menu.menuIsVisibleClass, !isVisible);
        isVisible ? menu.trigger.removeAttribute('aria-expanded') : menu.trigger.setAttribute('aria-expanded', true);
        if(isVisible) {
          menu.element.addEventListener('transitionend', menu.dropMenuClosed);
        } else {
          menu.element.addEventListener('transitionend', function cb(){
            menu.element.removeEventListener('transitionend', cb);
            focusFirstElement(menu, menu.element);
          });
          getLayoutValue(menu);
          setDropMenuMaxHeight(menu); // set max-height
          placeDropMenu(menu); // desktop only
        }
      });
    };
  
    function dropMenuVisible(menu) {
      return Util.hasClass(menu.element, menu.menuIsVisibleClass);
    };
  
    function showSubLevel(menu, menuBtn) {
      var mainLevel = menuBtn.closest('.'+menu.menuLevelClass),
        subLevel = Util.getChildrenByClassName(menuBtn.parentNode, menu.menuLevelClass);
      if(!mainLevel || subLevel.length == 0 ) return;
      // trigger classes
      Util.addClass(subLevel[0], menu.levelInClass);
      Util.addClass(mainLevel, menu.levelOutClass);
      Util.removeClass(mainLevel, menu.levelInClass);
      // animate height of main element
      animateDropMenu(menu, mainLevel.offsetHeight, subLevel[0].offsetHeight, function(){
        focusFirstElement(menu, subLevel[0]);
      });
    };
  
    function hideSubLevel(menu, menuBtn) {
      var subLevel = menuBtn.closest('.'+menu.menuLevelClass),
        mainLevel = subLevel.parentNode.closest('.'+menu.menuLevelClass);
      if(!mainLevel || !subLevel) return;
      // trigger classes
      Util.removeClass(subLevel, menu.levelInClass);
      Util.addClass(mainLevel, menu.levelInClass);
      Util.removeClass(mainLevel, menu.levelOutClass);
      // animate height of main element
      animateDropMenu(menu, subLevel.offsetHeight, mainLevel.offsetHeight, function(){
        var menuBtnIn = Util.getChildrenByClassName(subLevel.parentNode, menu.menuBtnInClass);
        if(menuBtnIn.length > 0) menuBtnIn[0].focus();
        // if primary level -> reset height of element + inner element
        if(Util.hasClass(mainLevel, 'js-drop-menu__list--main') && menu.layout == 'desktop') {
          menu.element.style.height = '';
          if(menu.innerElement.length > 0) menu.innerElement[0].style.height = '';
        }
      });
    };
  
    function animateDropMenu(menu, initHeight, finalHeight, cb) {
      if(menu.innerElement.length < 1) {
        if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
        return;
      }
      if(menu.layout == 'mobile') {
        menu.innerElement[0].style.height = finalHeight+"px";
        if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
        return;
      } else {
        menu.innerElement[0].style.height = "";
      }
      var resetHeight = false;
      // make sure init and final height are smaller than max height
      if(initHeight > menu.maxHeight) initHeight = menu.maxHeight;
      if(finalHeight > menu.maxHeight) {
        resetHeight = finalHeight;
        finalHeight = menu.maxHeight;
      }
      var change = finalHeight - initHeight,
        currentTime = null,
        duration = menu.animationDuration*1000;
  
      var animateHeight = function(timestamp){  
        if (!currentTime) currentTime = timestamp;         
        var progress = timestamp - currentTime;
        if(progress > duration) progress = duration;
        var val = Math.easeOutQuart(progress, initHeight, change, duration);
        menu.element.style.height = val+"px";
        if(progress < duration) {
          window.requestAnimationFrame(animateHeight);
        } else {
          menu.innerElement[0].style.height = resetHeight ? resetHeight+'px' : '';
          if(cb) cb();
        }
      };
      
      //set the height of the element before starting animation -> fix bug on Safari
      menu.element.style.height = initHeight+"px";
      window.requestAnimationFrame(animateHeight);
    };
  
    function resetAllLevels(menu) {
      var openLevels = menu.element.getElementsByClassName(menu.levelInClass),
        closeLevels = menu.element.getElementsByClassName(menu.levelOutClass);
      while(openLevels[0]) {
        Util.removeClass(openLevels[0], menu.levelInClass);
      }
      while(closeLevels[0]) {
        Util.removeClass(closeLevels[0], menu.levelOutClass);
      }
    };
  
    function focusFirstElement(menu, level) {
      var element = getFirstFocusable(level);
      element.focus();
    };
  
    function getFirstFocusable(element) {
      var elements = element.querySelectorAll(focusableElString);
      for(var i = 0; i < elements.length; i++) {
        if(elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
          return elements[i];
        }
      }
    };
  
    function getFocusableElements(menu) { // all visible focusable elements
      var elements = menu.element.querySelectorAll(focusableElString);
      menu.focusableElements = [];
      for(var i = 0; i < elements.length; i++) {
        if( isVisible(menu, elements[i]) ) menu.focusableElements.push(elements[i]);
      }
    };
  
    function isVisible(menu, element) {
      var elementVisible = false;
      if( (element.offsetWidth || element.offsetHeight || element.getClientRects().length) && getComputedStyle(element).getPropertyValue('visibility') == 'visible') {
        elementVisible = true;
        if(menu.element.contains(element) && element.parentNode) elementVisible = isVisible(menu, element.parentNode);
      }
      return elementVisible;
    };
  
    function initAutocomplete(menu) {
      if(!Util.hasClass(menu.element, 'js-autocomplete')) return;
      // get list of search results
      getSearchResults(menu);
      var autocompleteCharacters = 1;
      menu.autocompleteInput = menu.element.getElementsByClassName('js-autocomplete__input');
      menu.autocompleteList = menu.element.getElementsByClassName('js-autocomplete__results');
      new Autocomplete({
        element: menu.element,
        characters: autocompleteCharacters,
        searchData: function(query, cb) {
          var data = [];
          if(query.length >= autocompleteCharacters) {
            data = menu.searchResults.filter(function(item){
              return item['label'].toLowerCase().indexOf(query.toLowerCase()) > -1;
            });
          }
          cb(data);
        }
      });
    };
  
    function resetAutocomplete(menu) {
      if(menu.autocompleteInput && menu.autocompleteInput.length > 0) {
        menu.autocompleteInput[0].value = '';
      }
    };
  
    function getSearchResults(menu) {
      var anchors = menu.element.getElementsByClassName('drop-menu__link');
      for(var i = 0; i < anchors.length; i++) {
        menu.searchResults.push({label: anchors[i].textContent, url: anchors[i].getAttribute('href')});
      }
    };
  
    function setDropMenuMaxHeight(menu) {
      if(!menu.trigger) return;
      if(menu.layout == 'mobile') {
        menu.maxHeight = '100%';
        menu.element.style.maxHeight = menu.maxHeight;
        if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = 'calc(100% - '+menu.autocompleteInput[0].offsetHeight+'px)';
      } else {
        menu.maxHeight = window.innerHeight - menu.trigger.getBoundingClientRect().bottom - menu.verticalGap - 15;
        menu.element.style.maxHeight = menu.maxHeight + 'px';
        if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = (menu.maxHeight - menu.autocompleteInput[0].offsetHeight) + 'px';
      }
    };
  
    function getLayoutValue(menu) {
      menu.layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    };
  
    function placeDropMenu(menu) {
      if(menu.layout == 'mobile') {
        menu.element.style.top = menu.element.style.left = menu.element.style.right = '';
      } else {
        var selectedTriggerPosition = menu.trigger.getBoundingClientRect();
        
        var left = selectedTriggerPosition.left,
          right = (window.innerWidth - selectedTriggerPosition.right),
          isRight = (window.innerWidth < selectedTriggerPosition.left + menu.element.offsetWidth);
  
        var rightVal = 'auto', leftVal = 'auto';
        if(isRight) {
          rightVal = right+'px';
        } else {
          leftVal = left+'px';
        }
  
        var topVal = (selectedTriggerPosition.bottom+menu.verticalGap)+'px';
        if( isRight && (right + menu.element.offsetWidth) > window.innerWidth) {
          rightVal = 'auto';
          leftVal = parseInt((window.innerWidth - menu.element.offsetWidth)/2)+'px';
        }
        menu.element.style.top = topVal;
        menu.element.style.left = leftVal;
        menu.element.style.right = rightVal;
      }
    };
  
    function closeOnResize(menu) {
      getLayoutValue(menu);
      if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
      menu.trigger.click();
    };
  
    function closeOnClick(menu, target) {
      if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
      if(menu.element.contains(target) || menu.trigger.contains(target)) return;
      menu.trigger.click();
    };
  
    function initFocusOut(menu) {
      menu.element.addEventListener('keydown', function(event){
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
          getFocusableElements(menu);
          if( (menu.focusableElements[0] == document.activeElement && event.shiftKey) || (menu.focusableElements[menu.focusableElements.length - 1] == document.activeElement && !event.shiftKey)) {
            menu.trigger.click();
          }
        } else if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' && dropMenuVisible(menu)) {
          menu.trigger.click();
        }
      });
    };
  
    // init DropMenu objects
    var dropMenus = document.getElementsByClassName('js-drop-menu');
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable], summary';
    if( dropMenus.length > 0 ) {
      var dropMenusArray = [];
      for( var i = 0; i < dropMenus.length; i++) {(function(i){
        dropMenusArray.push(new DropMenu(dropMenus[i]));
      })(i);}
  
      // on resize -> close all drop menu elements
      window.addEventListener('resize', function(event){
        dropMenusArray.forEach(function(element){
          closeOnResize(element);
        });
      });
      
      // close drop menu when clicking outside it
      window.addEventListener('click', function(event){
        dropMenusArray.forEach(function(element){
          closeOnClick(element, event.target);
        });
      });
    }
  }());
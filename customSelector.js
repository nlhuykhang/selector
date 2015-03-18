/**
 *  @name custom-selector
 *  @description selector plugin
 *  @version 1.0
 *  @options
 *    effect
 *  @events
 *    click
 *    keydown
 *    focusout
 *  @methods
 *    init
 *    show
 *    hide
 *    destroy
 */
;(function($, window, undefined) {
  var pluginName = 'custom-selector',
    listItemSelect = [],
    hasOptGroup = false;

  var initVar = function() {
    listItemSelect = [];
    hasOptGroup = false;
  };

  var hideDefault = function(el) {
    el.hide();
  };

  var effectToggle = function(el, effect) {
    switch (effect) {
      case 'fade':
        el.fadeToggle(300);
        break;
      case 'show':
        el.toggle();
        break;
      case 'slide':
        el.slideToggle();
        break;
      default:
        el.fadeToggle(300);
        break;
    }
    return el;
  };

  var effectOut = function(el, effect) {
    switch (effect) {
      case 'fade':
        el.fadeOut(300);
        break;
      case 'show':
        el.hide();
        break;
      case 'slide':
        el.slideUp();
        break;
      default:
        el.fadeOut(300);
        break;
    }
    return el;
  };

  var getDataDefault = function(el) {
    var optGroup = el.children('optgroup');
    if (optGroup.length) {
      hasOptGroup = true;
      optGroup.each(function() {
        var el = $(this),
          temp = {
            'optgroup': el.attr('label'),
            'option': []
          };
        el.children('option').each(function() {
          temp.option.push($(this).text());
        });
        listItemSelect.push(temp);
      });
    } else {
      hasOptGroup = false;
      el.children('option').each(function() {
        listItemSelect.push($(this).text());
      });
    }
  };

  var liHandleClick = function(el) {
    if (!el.hasClass('opt-group')) {
      effectOut(el.siblings('.flag')
          .removeClass('flag')
          .end()
          .addClass('flag')
          .closest('ul'))
        .prev().text(el.text());
    }
  };

  var liHandleMouseEnter = function(el) {
    if (!el.hasClass('opt-group')) {
      el.siblings('.highlight-item')
        .removeClass('highlight-item')
        .end()
        .addClass('highlight-item');
    }
  };

  var liHandleMouseLeave = function(el) {
    el.removeClass('highlight-item');
  };

  var createCustom = function() {
    var temp = '',
      list = '';
    if (hasOptGroup) {
      temp = $.map(listItemSelect, function(val, i) {
        list = $.map(val.option, function(val, j) {
          if (i === 0 && j === 0) {
            return '<li class="flag">' + val + '</li>';
          } else {
            return '<li>' + val + '</li>';
          }
        }).join(' ');
        return '<li class="opt-group"><strong>' + val.optgroup + '</strong></li>' + list;
      }).join(' ');
    } else {
      temp = $.map(listItemSelect, function(val, j) {
        if (j === 0) {
          return '<li class="flag">' + val + '</li>';
        } else {
          return '<li>' + val + '</li>';
        }
      }).join(' ');
    }
    return $('<ul  id="dropdownlist-3">' + temp + '</ul>')
      .hide()
      .on('click', 'li', function(e) {
        e.stopPropagation();
        liHandleClick($(this));
      })
      .on('mouseenter', 'li', function() {
        liHandleMouseEnter($(this));
      })
      .on('mouseleave', 'li', function() {
        liHandleMouseLeave($(this));
      });
  };

  var selectorClick = function(el) {
    var list = el.children('#dropdownlist-3'),
      prop = el.data('prop');
    if (!list.length) {
      list = createCustom().appendTo(el);
    }
    list.children('.flag').addClass('highlight-item');
    effectToggle(list, prop.effect);
  };

  var selectorKeydown = function(el, key) {
    var curText = el.children('div'),
      curItem = curText.next().children('.flag'),
      prop = el.data('prop'),
      nextItem = null,
      preItem = null,
      isFound = false,
      nextAll = null,
      preAll = null;

    switch (key) {
      case 38: //up
        preItem = curItem.prev();
        if (preItem.hasClass('opt-group')) {
          preItem = preItem.prev();
        }
        if (preItem.length > 0) {
          curItem.removeClass('flag highlight-item');
          curText.text(preItem.addClass('flag highlight-item').text());
        }
        break;
      case 40: //down
        nextItem = curItem.next();
        if (nextItem.hasClass('opt-group')) {
          nextItem = nextItem.next();
        }
        if (nextItem.length > 0) {
          curItem.removeClass('flag highlight-item');
          curText.text(nextItem.addClass('flag highlight-item').text());
        }
        break;
      case 13: //enter
        curItem.addClass('highlight-item');
        effectToggle(el.children().last(), prop.effect);
        break;
      default:
        break;
    }

    if ((key >= 65 && key <= 90) || (key >= 48 && key <= 57)) {
      nextAll = curItem.nextAll(':not(.opt-group)');
      nextAll.each(function() {
        var el = $(this),
          val = el.text();
        if ((val.charCodeAt(0) === key) ||
          val.charCodeAt(0) === (key + 32)) {
          curItem.removeClass('flag highlight-item');
          el.addClass('flag highlight-item');
          curText.text(val);
          isFound = true;
          return false;
        }
      });
      if (!isFound) {
        preAll = curItem.siblings(':not(.opt-group)');
        preAll.each(function() {
          var el = $(this),
            val = el.text();
          if ((val.charCodeAt(0) === key) ||
            val.charCodeAt(0) === (key + 32)) {
            curItem.removeClass('flag highlight-item');
            el.addClass('flag highlight-item');
            curText.text(val);
            return false;
          }
        });
      }
    }
  };

  var selectorFocusout = function(el) {
    effectOut(el.children().last());
  };

  var initCustom = function(el, ef) {
    var curItem = hasOptGroup ? listItemSelect[0].option[0] : listItemSelect[0];
    el.after(
      $('<div tabindex="-1"><div>' + curItem + '</div></div>')
      .append(createCustom())
      .data('prop', {
        effect: ef,
        hasOptGroup: hasOptGroup
      })
      .on('click', function() {
        selectorClick($(this));
      })
      .on('keydown', function(e) {
        e.preventDefault();
        selectorKeydown($(this), e.which);
      })
      .on('focusout', function() {
        selectorFocusout($(this));
      })
    );
  };

  var onShow = function() {
    var el = $(this).next().children().last();
    if (el.css('display') === 'none') {
      el.trigger('click');
    }
  };

  var onHide = function() {
    var el = $(this).next().children().last();
    if (el.css('display') !== 'none') {
      el.trigger('click');
    }
  };

  var destroyElement = function(el) {
    el.show().next().remove();
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this;
      initVar();
      hideDefault(that.element);
      getDataDefault(that.element);
      initCustom(that.element, that.options.effect);
      this.element.on('onShow', onShow);
      this.element.on('onHide', onHide);
    },
    show: function() {
      this.element.trigger('onShow');
    },
    hide: function() {
      this.element.trigger('onHide');
    },
    changeEffect: function(eff) {
      var el = $(this.element).next(),
        prop = el.data('prop');
      if (eff === 'slide' || eff === 'show' || eff === 'slide') {
        prop.effect = eff;
      } else {
        prop.effect = 'fade';
      }
      el.data('prop', prop);
    },
    destroy: function() {
      $.removeData(this.element[0], pluginName);
      this.element.off('onShow', onShow);
      this.element.off('onHide', onHide);
      destroyElement(this.element);
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      } else {
        window.console && console.log(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
      }
    });
  };

  $.fn[pluginName].defaults = {
    effect: 'fade'
  };
  $(function() {
    $('[data-' + pluginName + ']')[pluginName]({
      effect: 'fade'
    });
  });
}(jQuery, window));
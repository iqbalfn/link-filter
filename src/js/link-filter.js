/**
 * --------------------------------------------------------------------------
 * Link Filter (v0.0.1): link-filter.js
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'linkfilter'
const VERSION            = '0.0.1'
const DATA_KEY           = 'bs.linkfilter'
const EVENT_KEY          = `.${DATA_KEY}`
const DATA_API_KEY       = '.data-api'
const JQUERY_NO_CONFLICT = $.fn[NAME]
const KEY_UP             = 38
const KEY_DOWN           = 40
const KEY_ENTER          = 13

// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
const RE_KEYS            = [ "-" , "[" , "]" , "/" , "{" , "}" , "(" , ")" , "*" , "+" , "?" , "." , "\\" , "^" , "$" , "|" ].join('\\')
const RE_ESCAPE          = RegExp('[' + RE_KEYS + ']', 'g')

const Default = {
    active      : 'active',
    delay       : 300,
    input       : 'string'
}

const DefaultType = {
    active      : 'string',
    delay       : 'number',
    input       : 'string'
}

const Event = {
    FINDING     : `finding${EVENT_KEY}${DATA_API_KEY}`,
    FOUND       : `found${EVENT_KEY}${DATA_API_KEY}`,
    EMPTY       : `empty${EVENT_KEY}${DATA_API_KEY}`,
    KEYDOWN     : `keydown${EVENT_KEY}${DATA_API_KEY}`
}

const ClassName = {
    NOT_MATCH   : 'linkfilter-not-match'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class LinkFilter {
    constructor(element, config) {
        this._config                = this._getConfig(config)
        this._element               = element
        this._input                 = document.querySelector(config.input)
        this._timer                 = null;

        this._addElementListener()
    }

    // Getters

    static get VERSION() {
        return VERSION
    }

    static get Default() {
        return Default
    }

    // Public

    dispose() {
        [this._input]
            .forEach((htmlElement) => $(htmlElement).off(EVENT_KEY))

        $.removeData(this._element, DATA_KEY)

        this._config                = null
        this._element               = null
        this._timer                 = null
        this._input                 = null
    }

    // Private

    _addElementListener(){
        $(this._input).on(Event.KEYDOWN, e => {
            if(e.keyCode === KEY_ENTER)
                return this._clickActive(e)
            if(e.keyCode === KEY_DOWN)
                return this._focusNextItem(e)
            if(e.keyCode === KEY_UP)
                return this._focusPrevItem(e)

            if(this._timer)
                clearTimeout(this._timer)

            this._timer = setTimeout( el => this._findItem(el), this._config.delay, this._input)
        })
    }

    _clickActive(e){
        let el = this._element.querySelector(`.${this._config.active}`)
        if(el.tagName != 'A')
            el = el.querySelector('a')
        if(el)
            el.click()
        e.preventDefault()
    }

    _focusNextItem(e){
        let next, current

        for(let i=(this._element.children.length -1 ); i>=0; i--){
            let child = this._element.children[i]

            if(child.classList.contains(ClassName.NOT_MATCH))
                continue

            if(child.classList.contains(this._config.active)){
                current = child
                if(next)
                    break
                continue
            }

            next = child
        }

        if(next){
            if(current)
                current.classList.remove( this._config.active )
            next.classList.add( this._config.active )
        }

        e.preventDefault()
    }

    _focusPrevItem(e){
        let prev, current

        for(let i=0; i<this._element.children.length; i++){
            let child = this._element.children[i]

            if(child.classList.contains(ClassName.NOT_MATCH))
                continue

            if(child.classList.contains(this._config.active)){
                current = child
                if(prev)
                    break
                continue
            }

            prev = child
        }

        if(prev){
            if(current)
                current.classList.remove( this._config.active )
            prev.classList.add( this._config.active )
        }
        e.preventDefault()
    }

    _findItem(relatedTarget){
        const findingEvent = $.Event(Event.FINDING, {relatedTarget})
        $(this._element).trigger(findingEvent)

        let val = this._input.value.trim().replace(RE_ESCAPE, "\\$&")
        let re  = new RegExp(val, 'i')

        let found = false;
        $(this._element).children().each((i,e) => {
            if(!val || re.test(e.innerText)){
                found = true
                e.classList.remove( ClassName.NOT_MATCH)
                e.style.removeProperty('display')
            }else{
                e.style.display = 'none'
                e.classList.add( ClassName.NOT_MATCH )
                if(e.classList.contains( this._config.active ))
                    e.classList.remove( this._config.active )
            }
        })

        let finalEvent
        if(found){
            finalEvent = $.Event(Event.FOUND, {relatedTarget})
        }else{
            finalEvent = $.Event(Event.EMPTY, {relatedTarget})
        }

        $(this._element).trigger(finalEvent)
    }

    _getConfig(config) {
        config = {
            ...Default,
            ...config
        }
        Util.typeCheckConfig(NAME, config, DefaultType)
        return config
    }

    // Static

    static _jQueryInterface(config, relatedTarget) {
        return this.each(function () {
            let data = $(this).data(DATA_KEY)
            const _config = {
                ...Default,
                ...$(this).data(),
                ...typeof config === 'object' && config ? config : {}
            }

            if (!data) {
                data = new LinkFilter(this, _config)
                $(this).data(DATA_KEY, data)
            }
        })
    }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = LinkFilter._jQueryInterface
$.fn[NAME].Constructor = LinkFilter
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return LinkFilter._jQueryInterface
}

export default LinkFilter
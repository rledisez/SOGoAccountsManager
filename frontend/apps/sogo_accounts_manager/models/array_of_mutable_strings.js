/**
 * SOGoAccountsManager - a web-based users accounts manager which
 *                       integrates well with SOGo
 * Copyright (c) 2011-2012 Romain LE DISEZ
 *
 * This file is part of SOGoAccountsManager.
 *
 * SOGoAccountsManager is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SOGoAccountsManager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with SOGoAccountsManager.  If not, see <http://www.gnu.org/licenses/>.
 */

sc_require('core');

MutableString = SC.Object.extend({
    //
    value: '',
    
    toString: function() {
        return this.valueOf();
    },
    
    toJSON: function() {
        return this.valueOf();
    },
    
    valueOf: function() {
        return this.value.toString();
    },
});



SOGoAccountsManager.ArrayOfMutableStrings = function() {
    var arr = [];
    arr.__proto__ = SOGoAccountsManager.ArrayOfMutableStrings.prototype;
    return arr;
}
SOGoAccountsManager.ArrayOfMutableStrings.prototype = new Array;
SOGoAccountsManager.ArrayOfMutableStrings.prototype.replace = function(start, amt, objects) {
    console.debug('SOGoAccountsManager.ArrayOfMutableStrings.prototype.replace(): enter');

    if( objects && objects.isSCArray ) {
        var that = this;
        objects.forEach( function(obj, idx) {
            if( !SC.kindOf(objects[idx], MutableString) ) {
                objects[idx] = MutableString.create({ value: objects[idx].toString() });
            }

            // Remove obsolete observers...
            objects[idx].observersForKey('value').forEach( function(observer) {
                objects[idx].removeObserver('value', observer[0], observer[1]);
            });
            // ... and add the one needed
            objects[idx].addObserver('value', that, that.aMutableStringDidChange);
        } );
    }

    return Array.prototype.replace.call(this, start, amt, objects);
};
SOGoAccountsManager.ArrayOfMutableStrings.prototype.aMutableStringDidChange = function() {
    console.debug('SOGoAccountsManager.ArrayOfMutableStrings.prototype.aMutableStringDidChange(): enter');
    this.notifyPropertyChange('[]');
};



SC.RecordAttribute.registerTransform(SOGoAccountsManager.ArrayOfMutableStrings, {
    // Convert an array of strings to an array of objects with the attribute 'value'
    to: function(value, attr, type, record, key) {
        console.debug('SC.RecordAttribute.registerTransform(SOGoAccountsManager.ArrayOfMutableStrings).to');

        var objects = new SOGoAccountsManager.ArrayOfMutableStrings();
        if( value && value.isSCArray ) {
            objects.pushObjects(value);
        }
        return objects;
    },

    observesChildren: ['[]']
});


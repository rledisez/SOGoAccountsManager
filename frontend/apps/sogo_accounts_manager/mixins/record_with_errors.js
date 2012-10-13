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

SOGoAccountsManager.RecordWithErrors = {
    _errorMessages: SC.Object.create(),
    errorMessages: function(key, value) {
        if( value !== undefined ) {
            var attributesByKey = this.get('attributesByKey');
            for(var key in attributesByKey) {
                var attrName = attributesByKey[key];
                var attrError = ( value && value[key] )
                    ? value[key]
                    : null;
                this._errorMessages.set(attrName, attrError);
            }
        }

        return this._errorMessages;
    }.property().cacheable(),
    
    attributesByKey: function() {
        var attributesByKey = {};

        for(var attrName in this) {
            if( SC.kindOf(this[attrName], SC.RecordAttribute) ) {
                key = ( this[attrName] && this[attrName].get && this[attrName].get('key') )
                    ? this[attrName].get('key')
                    : attrName;
                attributesByKey[key] = attrName;
            }
        }
        
        return attributesByKey;
    }.property().cacheable(),
};

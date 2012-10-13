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

SOGoAccountsManager.TextFieldError = {
    errorMessage: null,
    _errorMessagePane: null,

    initMixin: function() {
        // FIXME: private property, do not use it
        var bindingPath = this.valueBinding._fromPropertyPath;
        bindingPath = bindingPath.replace(/\.([^\.]+)$/, ".errorMessages.$1");
        this.bind('errorMessage', bindingPath);

        this._errorMessagePane = SC.PickerPane.create({
            layout: { width: 200, height: 70 },
            classNames: ['error-message'],
            preferType: SC.PICKER_POINTER,
            preferMatrix: [0, 3, 2, 1, 3],
            isModal: NO,
            acceptsKeyPane: NO,

            contentView: SC.LabelView.extend({
                value: ''
            }),
        });
    },

    fieldDidFocus: function(event) {
        sc_super();
        if( this.get('errorMessage') ) {
            this._errorMessagePane.popup(this);
        }
    },

    fieldDidBlur: function(event) {
        sc_super();
        this._errorMessagePane.remove();
    },

    _errorMessageDidChange: function() {
        var classNames = this.get('classNames');

        if( this.get('errorMessage') ) {
            if( !classNames.contains('error') ) {
                classNames.push('error');
            }

            var errorMessage = this.get('errorMessage');
            if( !SC.isArray(errorMessage) ) {
                errorMessage = [errorMessage];
            }
            this._errorMessagePane.contentView.set('value', SC.String.loc.apply('', errorMessage));

        } else {
            classNames.removeObject('error');
            this._errorMessagePane.contentView.set('value', '');
        }

        this.set('classNames', classNames);
        this.set('layerNeedsUpdate', YES);
    }.observes('errorMessage'),
};

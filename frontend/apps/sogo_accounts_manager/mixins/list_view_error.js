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

SOGoAccountsManager.ListViewError = {
    errorMessage: null,

    init: function() {
        sc_super();

        // FIXME: private property, do not use it
        var bindingPath = this.contentBinding._fromPropertyPath;
        bindingPath = bindingPath.replace(/\.([^\.]+)$/, ".errorMessage");
        this.bind('errorMessage', bindingPath);
    },

    /**
     * Ensure that when ItemViews are rebuilt, their errorMessages are updated
     */
    reloadIfNeeded: function() {
        sc_super();
        this.invokeLast('_errorMessageDidChange');
    },

    /**
     * When errorMessage changes, this method updates:
     *  - the errorMessage of all the ItemView;
     *  - the ListView CSS class.
     */
    _errorMessageDidChange: function() {
        var errorMessage = this.get('errorMessage');
        var hasError = NO;

        if( !errorMessage || typeof(errorMessage) !== 'object' ) {
            // Set an empty error message (for forwarding to item)
            errorMessage = {};
        }

        var itemViews = ( this._sc_itemViews )
            ? this._sc_itemViews
            : [];

        itemViews.forEach(function(itemView, idx) {
            var itemValue = itemView.get('content').get('value');
            var itemErrorMessage = ( errorMessage[ itemValue ] )
                ? errorMessage[ itemValue ]
                : null;

            itemView.set('errorMessage', itemErrorMessage);
            if( itemErrorMessage ) { hasError = YES; }
        });


        var classNames = this.get('classNames');

        if( hasError ) {
            if( !classNames.contains('error') ) {
                classNames.push('error');
            }

        } else {
            classNames.removeObject('error');
        }

        this.set('classNames', classNames);
        this.set('layerNeedsUpdate', YES);
    }.observes('errorMessage'),
};

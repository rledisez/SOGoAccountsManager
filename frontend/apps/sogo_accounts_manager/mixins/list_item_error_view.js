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

/**
 * Change the state of the item when errorMessage is set. The content of
 * errorMessage is displayed in a tooltip (PickerPane) when the item is
 * selected.
 */
SOGoAccountsManager.ListItemErrorView = SC.ListItemView.extend({
    errorMessage: null,
    _errorMessagePane: null,

    /**
     * Create the PickerPane
     */
    init: function() {
        sc_super();
        this._errorMessagePane = SC.PickerPane.create({
            layout: { width: 200, height: 70 },
            classNames: ['error-message'],
            preferType: SC.PICKER_POINTER,
            preferMatrix: [0, 3, 2, 1, 3],
            isModal: NO, // Do not prevent access to others UI elements
            acceptsKeyPane: NO, // Do not take keyboard focus when displayed

            contentView: SC.LabelView.extend({
                value: ''
            }),
        });
    },

    /**
     * Be sure that the PickerPane is hidden when the itemView is destroyed
     */
    destroy: function() {
        this._errorMessagePane.remove();
        sc_super();
    },
    isVisibleInWindowDidChange: function() {
        if( !this.get('isVisibleInWindow') ) {
            this._errorMessagePane.remove();
        } else {
            // invokeLater, so the item is positioned before the PickerPane is displayed
            this.invokeLater('isSelectedDidChange');
        }
    }.observes('isVisibleInWindow'),

    inlineEditorDidCommitEditing: function() {
        sc_super();
        // After an edition, refocus the ListView so the user can navigate in others items
        this.parentView.becomeFirstResponder();
    },

    /**
     * Display or hide the PickerPane when the itemView is (de)selected
     */
    isSelectedDidChange: function() {
        if( this.get('isSelected') && this.get('errorMessage') ) {
            this._errorMessagePane.popup(this);
        } else {
            this._errorMessagePane.remove();
        }
    }.observes('isSelected'),

    /**
     * Change the CSS classes of the itemView according to the presence of an
     * errorMessage and translate the errorMessage
     */
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
});

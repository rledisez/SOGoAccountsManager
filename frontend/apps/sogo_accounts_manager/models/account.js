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
sc_require('models/array_of_mutable_strings');
sc_require('mixins/record_with_errors');

SOGoAccountsManager.Account = SC.Record.extend(SOGoAccountsManager.RecordWithErrors, {
    primaryKey: 'employeeNumber',
    id: SC.Record.attr(String, { key: 'employeeNumber' }),

    mail: SC.Record.attr(String),
    password: SC.Record.attr(String),
    passwordConfirmation: SC.Record.attr(String),

    firstName: SC.Record.attr(String, { key: 'givenName' }),
    lastName: SC.Record.attr(String, { key: 'sn' }),
    displayName: SC.Record.attr(String, { key: 'cn' }),

    mailAlias: SC.Record.attr(SOGoAccountsManager.ArrayOfMutableStrings),
    mailAliasController: null,

    title: SC.Record.attr(String),
    department: SC.Record.attr(String, { key: 'ou' }),
    organization: SC.Record.attr(String, { key: 'o' }),
    address: SC.Record.attr(String, { key: 'street' }),
    city: SC.Record.attr(String, { key: 'l' }),
    state: SC.Record.attr(String, { key: 'st' }),
    postalCode: SC.Record.attr(String),

    workPhone: SC.Record.attr(String, { key: 'telephoneNumber' }),
    homePhone: SC.Record.attr(String),
    mobile: SC.Record.attr(String),
    fax: SC.Record.attr(String, { key: 'facsimileTelephoneNumber' }),
    pager: SC.Record.attr(String),

    init: function() {
        sc_super();
        
        // Init the controller here so we are sure it is correctly binded
        var mailAliasController = SC.ArrayController.create();
        SC.Binding.from('mailAlias', this).to('content', mailAliasController).connect();
        SC.Binding.from('errorMessages.mailAlias', this).to('errorMessage', mailAliasController).connect();
        this.set('mailAliasController', mailAliasController);
    },
});


SOGoAccountsManager.Account.mixin({
    BASE_URL: SOGoAccountsManager.API_BASE_URL + '/accounts',

    QUERY: SC.Query.local(SOGoAccountsManager.Account, {
        orderBy: 'lastName,firstName DESC',
    }),
});

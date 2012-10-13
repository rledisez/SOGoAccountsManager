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

SOGoAccountsManager.CheckingAuthenticationState = SC.State.design({ 
    
    enterState: function() {
        $('body').append('<div id=\'loading\'><p class=\'loading\'>'+"Authenticating...".loc()+'</p></div>');

        SC.Request.getUrl(SOGoAccountsManager.API_BASE_URL + '/checkAuth')
            .header({'Accept': 'application/json'})
            .json()
            .notify(this, function(response) {
                if( SC.ok(response) ) {
                    SOGoAccountsManager.statechart.sendEvent('authenticationSucceeded', response);

                } else {
                    SOGoAccountsManager.statechart.sendEvent('authenticationFailed', response);
                }
            })
            .send();
    },

    exitState: function() {
        $('div#loading').remove();
    },

    authenticationSucceeded: function(response) {
        this.gotoState('operatingApplicationsState');
    },

    authenticationFailed: function(response) {
        switch(response.rawRequest.status) {
            case 401:
                description = "Please authenticate to SOGo before using the accounts manager.";
                break;
            case 403:
                description = "You are not allowed to use the accounts manager.";
                break;
            default:
                description = "Server returned an error while checking your authentication. Please try again later.";
                break;
        }
        SC.AlertPane.error({
            message: "Authentication failed".loc(),
            description: description.loc(),
            buttons: [
                {
                    title: "Close".loc(),
                    action: function() {
                        window.location.href = "/SOGo/";
                    },
                }
            ],
        });
    },

});


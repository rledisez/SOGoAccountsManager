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

SOGoAccountsManager.main = function main() {
    // Logging level
    if( SOGoAccountsManager.logging_level < 4 ) console.debug = function() {};
    if( SOGoAccountsManager.logging_level < 3 ) console.info = console.log = function() {};
    if( SOGoAccountsManager.logging_level < 2 ) console.warn = function() {};
    if( SOGoAccountsManager.logging_level < 1 ) console.error = function() {};

    // Initialize statechart
    var statechart = SOGoAccountsManager.statechart;
    SC.RootResponder.responder.set('defaultResponder', statechart);
    statechart.initStatechart();
};

function main() { SOGoAccountsManager.main(); }

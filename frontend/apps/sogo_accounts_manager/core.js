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

SOGoAccountsManager = SC.Application.create({
    NAMESPACE: 'SOGoAccountsManager',
    VERSION: '0.1.0',
    API_BASE_URL: '/SOGo/AccountsManager/api',

    store: SC.Store.create()
        .from('SOGoAccountsManager.RestDataSource')
        .set('commitRecordsAutomatically', NO),

    // Logging level:
    //   0 -> Disable logging
    //   1 -> ERROR     console.error()
    //   2 -> WARNING   console.warn()
    //   3 -> INFO      console.log()
    //   4 -> DEBUG     console.debug()
    logging_level: 2,
});

<?php
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

return array(
    /**
     * SOGoAccountsManager parameters
     */
    'informationsStore.namespace' => '\Generic\SOGoMut',
    'informationsStore.params.ldap' => array(
        'host'              => '127.0.0.1',
        'port'              => 389,
        'username'          => 'cn=SOGoAccountsManager,ou=DIT Roles,dc=example,dc=com',
        'password'          => 'secret-password',
        'bindRequiresDn'    => true,
        //'accountDomainName' => 'foo.net',
        'baseDn'            => 'ou=Customers,dc=example,dc=com',
    ),

    /**
     * SOGo parameters
     */
    'sogo.db.dsn' => 'pgsql:host=/tmp;dbname=sogo',
    'sogo.db.user' => 'sogo',
    'sogo.db.password' => 'password',
    'sogo.db.OCSSessionsFolder' => 'sogo_sessions_folder',

    /**
     * Slim parameters
     */
    //'mode' => 'production',
    'debug' => false,
    'log.enabled' => true,
);

<?php
/**
 * SOGoAccountsManager - a web-based users accounts manager which
 *                       integrates well with SOGo
 * Copyright (c) 2011-2013 Romain LE DISEZ
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

namespace SOGoAccountsManager\Middleware;

use stdClass;
use Exception;
use \CFPropertyList\CFPropertyList;

class SOGoConfiguration extends \Slim\Middleware
{
    public function call()
    {
        $sysconfig_file = ( $this->app->config('sogo.sysconfig_file') )
            ? $this->app->config('sogo.sysconfig_file')
            : '/etc/sogo/sogo.conf';
        $userconfig_file = ( $this->app->config('sogo.userconfig_file') )
            ? $this->app->config('sogo.userconfig_file')
            : '/var/lib/sogo/GNUstep/Defaults/.GNUstepDefaults';

        $sysconfig = $this->_readSOGoConfig($sysconfig_file);
        $userconfig = $this->_readSOGoConfig($userconfig_file);

        $config = (object)array_merge(
                (array)$sysconfig,
                (array)$userconfig,
                (array)$this->app->config('sogo.config') );

        $this->app->config('sogo', $config);

        $this->next->call();
    }

    private function _readSOGoConfig($file)
    {
        if( is_readable($file) ) {
            $plist = new CFPropertyList($file);
            return $this->_convertPlistToConfig($plist);
        } else {
            return  array();
        }
    }

    /**
     * Convert a PropertyList to an object. Dictionnaries are converted to
     * objects, Arrays are converted to arrays.
     */
    private function _convertPlistToConfig($value) {
        if( get_class($value) == 'CFPropertyList\CFPropertyList' || get_class($value) == 'CFPropertyList\CFDictionary' ) {
            $res = new stdClass();
            foreach($value->getValue() as $k => $v) $res->{$k} = $this->_convertPlistToConfig($v);

        } else if( get_class($value) == 'CFPropertyList\CFArray' ) {
            $res = array();
            foreach($value->getValue() as $k => $v) $res[$k] = $this->_convertPlistToConfig($v);

        } else {
            $res = $value->getValue();
        }

        return $res;
    }

    public static function getDbInfoFromUrl($url)
    {
        if( ! preg_match('#^(mysql|postgresql)://(.+):(.+)@(.*)/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)$#', $url, $matches) ) {
            throw new Exception('invalid config: OCSSessionsFolderURL does not match regular expression');
        }

        return array(
            'dsn'      => sprintf('%s:host=%s;dbname=%s', $matches[1], $matches[4], $matches[5]),
            'user'     => $matches[2],
            'password' => $matches[3],
            'table'    => $matches[6],
        );
    }
}

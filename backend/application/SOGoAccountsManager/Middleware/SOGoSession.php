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

use Exception;
use \SOGoAccountsManager\Utils\PDO;
use \SOGoAccountsManager\Exception\UserFriendlyException;

class SOGoSession extends \Slim\Middleware
{
    public function call()
    {
        list($username, $password) = $this->_getSOGoCredentials();

        $env = $this->app->environment();
        $env['SOGoAccountsManager.credentials.username'] = $username;
        $env['SOGoAccountsManager.credentials.password'] = $password;

        $this->next->call();
    }


    private function _getSOGoCredentials()
    {
        $cookie = $this->_getSOGoCookie();
        list($sessionId, $encryptionKey) = $this->_parseSOGoCookie($cookie);
        $cipher = $this->_getEncryptedSessionDataFromDatabase($sessionId);
        $clear = $this->_decryptSessionData($cipher, $encryptionKey);

        return explode(':', $clear);
    }

    private function _getSOGoCookie()
    {
        if( !isset($_COOKIE['0xHIGHFLYxSOGo']) ) {
            throw new UserFriendlyException(401, 'You must be authenticated to access this resource');

        } elseif( !is_string($_COOKIE['0xHIGHFLYxSOGo']) || strlen($_COOKIE['0xHIGHFLYxSOGo']) <= 6 ) {
            throw new UserFriendlyException(400, 'Invalid authentication cookie');
        }

        return substr($_COOKIE['0xHIGHFLYxSOGo'], 6);
    }

    private function _parseSOGoCookie($cookie)
    {
        $cookieValues = explode(':', base64_decode($cookie, true));

        if( !is_array($cookieValues) || count($cookieValues) !== 2 ) {
            throw new UserFriendlyException(400, 'Cannot parse authentication cookie');
        }

        $sessionId = $cookieValues[1];
        $encryptionKey = base64_decode($cookieValues[0], true);

        return array($sessionId, $encryptionKey);
    }

    private function _getEncryptedSessionDataFromDatabase($sessionId)
    {
        $OCSSessionsFolderURL = $this->app->config('sogo')->OCSSessionsFolderURL;
        $dbInfo = SOGoConfiguration::getDbInfoFromURL($OCSSessionsFolderURL);

        $dbh = new PDO($dbInfo['dsn'], $dbInfo['user'], $dbInfo['password']);

        $sql = 'SELECT c_value
                FROM '.$dbInfo['table'].'
                WHERE c_id = ?';
        $args = array($sessionId);

        $sth = $dbh->prepare($sql);
        if( $sth->execute($args) && ($result = $sth->fetch()) ) {
            $value = $result->c_value;
            $sth->closeCursor();
            $sth = null;

            $this->_updateSessionLastSeenToNowInDatabase($sessionId);

            return base64_decode($value, true);

        } else {
            throw new Exception('Db error: unable to fetch session informations');
        }
    }

    private function _updateSessionLastSeenToNowInDatabase($sessionId)
    {
        $OCSSessionsFolderURL = $this->app->config('sogo')->OCSSessionsFolderURL;
        $dbInfo = SOGoConfiguration::getDbInfoFromURL($OCSSessionsFolderURL);

        $dbh = new PDO($dbInfo['dsn'], $dbInfo['user'], $dbInfo['password']);

        $sql = 'UPDATE '.$dbInfo['table'].'
                SET c_lastseen = ?
                WHERE c_id = ?';
        $args = array(time(), $sessionId);

        $sth = $dbh->prepare($sql);
        $sth->execute($args);
        $sth->closeCursor();
    }

    private function _decryptSessionData($cipher, $encryptionKey)
    {
        $clear = '';

        $klen = strlen($encryptionKey);
        for($i=0; $i<$klen; $i++) {
            $clear .= chr(ord($encryptionKey[$i]) ^ ord($cipher[$i]));
        }

        return $clear;
    }
}

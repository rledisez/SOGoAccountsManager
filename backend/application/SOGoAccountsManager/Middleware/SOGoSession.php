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

namespace SOGoAccountsManager\Middleware;

use Exception;
use PDO;

class SOGoSession extends \Slim\Middleware {
    /**
     * Call
     * @return void
     */
    public function call() {
        $username = false;
        $password = false;

        try {
            list($username, $password) = $this->_getSOGoCredentials();

        } catch(Exception $e) {
            $this->app->contentType('text/html');
            $this->app->response()->status(500);
            $this->app->response()->body($e->getMessage());
            return;
        }

        if( $username === false || $password === false ) {
            // Not authenticated
            $this->app->contentType('text/html');
            $this->app->response()->status(401);
            $this->app->response()->body('You must be authenticated to access this resource');
            return;
        }

        $env = $this->app->environment();
        $env['SOGoAccountsManager.credentials.username'] = $username;
        $env['SOGoAccountsManager.credentials.password'] = $password;

        $this->next->call();
    }


    /* #################### GET THE SESSION INFORMATIONS ################### */
    /* ####################   FROM COOKIE AND DATABASE   ################### */

    private function _getSOGoCredentials()
    {
        if( !isset($_COOKIE['0xHIGHFLYxSOGo']) ) {
            return array(false, false);
        }

        list($encryptionKey, $sessionKey) = $this->_readLoginCookie($_COOKIE['0xHIGHFLYxSOGo']);
        $securedValue = $this->_valueForSessionKey($sessionKey);
        $value = $this->_valueFromSecuredValue($encryptionKey, $securedValue);

        $ret = explode(':', $value);
        if( count($ret) !== 2 ) {
            throw new Exception('incorrect decryption');
        }

        return $ret;
    }

    private function _readLoginCookie($cookie)
    {
        if( !is_string($cookie) || strlen($cookie) <= 6 ) {
            throw new Exception('unexpected cookie (cannot read)');
        }

        $value = substr($cookie, 6);
        $loginValues = explode(':', base64_decode($value, true));

        if( !is_array($loginValues) || count($loginValues) !== 2 ) {
            throw new Exception('unexpected cookie (cannot decode)');
        }

        return $loginValues;
    }
    
    private function _valueForSessionKey($sessionKey)
    {
        $value = null;
        $dbh = new PDO($this->app->config('sogo.db.dsn'));

        $sql = 'SELECT c_value
                FROM '.$this->app->config('sogo.db.OCSSessionsFolder').'
                WHERE c_id = ?
                  AND c_lastseen > ?';
        $args = array($sessionKey, time() - (int)$this->app->config('sessionTimeout')*60);

        $sth = $dbh->prepare($sql);
        if( $sth->execute($args) && ($result = $sth->fetch(PDO::FETCH_OBJ)) ) {
            $value = $result->c_value;
            $sth->closeCursor();
            $sth = null;

            $sql = 'UPDATE '.$this->app->config('sogo.db.OCSSessionsFolder').'
                    SET c_lastseen = ?
                    WHERE c_id = ?';
            $args = array(time(), $sessionKey);

            $sth = $dbh->prepare($sql);
            $sth->execute($args);
            $sth->closeCursor();
            $sth = null;
        }

        return $value;
    }

    private function _valueFromSecuredValue($encryptionKey, $securedValue)
    {
        if( empty($encryptionKey) || empty($securedValue) ) {
            throw new Exception('cannot decrypt');
        }

        $key = base64_decode($encryptionKey, true);
        $klen = strlen($key);
        
        $pass = base64_decode($securedValue);
        $clear = '';
        for($i=0; $i<$klen; $i++) {
            $clear .= chr(ord($key[$i]) ^ ord($pass[$i]));
        }

        return $clear;
    }
}

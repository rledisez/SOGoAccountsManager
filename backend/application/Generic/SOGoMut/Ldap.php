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

namespace Generic\SOGoMut;

use Exception;

use \SOGoAccountsManager\Exception\UserFriendlyException;

use \Zend\Ldap\Dn;
use \Zend\Ldap\Filter;

class Ldap extends \Zend\Ldap\Ldap
{
    public function getUserBaseDn($uid)
    {
        // Search the user in the directory
        $result = $this->search(array(
            'filter'        => '(&(|(objectClass=person)(objectClass=mailRecipient))(mail='.Filter::escapeValue($uid).'))',
            'attributes'    => array('employeeNumber'),
            'sizelimit'     => 2,
        ));

        if( $result->count() < 1 ) {
            throw new Exception('not found');

        } else if( $result->count() > 1 ) {
            throw new Exception('somethind bad happened');
        }

        $entry = $result->getFirst();
        $userDn = $entry['dn'];
        $branchDn = Dn::factory($userDn)->getParentDn(1);

        // Search the subtree the user is an administrator
        $subtree = null;
        for($i=1; $i<=3; $i++) {
            $result = $this->search(array(
                'filter'        => '(&(objectClass=groupOfNames)(member='.Filter::escapeValue($userDn).'))',
                'basedn'        => $subtree = $branchDn->getParentDn($i),
                'attributes'    => array('employeeNumber'),
                'sizelimit'     => 2,
            ));

            if( $result->count() === 1 ) {
                break;
            } else {
                $subtree = null;
            }
        }
        if( is_null($subtree) ) {
            throw new UserFriendlyException(403, 'Access denied', 'You are not allowed to access this resource.');
        }

        return $subtree->toString();
    }

    public function getUUID($attributeName, $tries = 5)
    {
        if( !is_string($attributeName) || empty($attributeName) || !is_int($tries) ) {
            // TODO: real exception
            throw new Exception('bad parameter');
        }

        if( $tries < 1 || $tries > 20 ) {
            $tries = 5;
        }

        // Generate an uuid and check its unicity by searching in LDAP ($tries tries max)
        $uuid = null;
        $cnt = 0;
        while( $uuid === null && $cnt++ < $tries ) {
            // Generate UUIDv4 (http://stackoverflow.com/a/10861056)
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            // Validate its unicity
            // TODO: escape $attributeName?
            $result = $this->search(array(
                'filter'        => '('.$attributeName.'='.Filter::escapeValue($uuid).')',
                'attributes'    => array($attributeName),
                'sizelimit'     => 1,
            ));

            if( $result->count() > 0 ) {
                $uuid = null;
            }
        }

        if( $uuid === null ) {
            // Seriously? Something is really bad on this server...
            throw new Exception('Unable to generate an unique UUID');
        }

        return $uuid;
    }
}

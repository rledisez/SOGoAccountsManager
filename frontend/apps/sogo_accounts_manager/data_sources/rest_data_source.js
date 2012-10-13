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

sc_require('models/account');

/**
 * Bridge between the datastore and the REST backend.
 */
SOGoAccountsManager.RestDataSource = SC.DataSource.extend({

    // ..........................................................
    // QUERY SUPPORT
    // 

    fetch: function(store, query)
    {
        console.debug('SOGoAccountsManager.RestDataSource.fetch(): enter');

        var baseUrl = this._baseUrlFor(store, query);
        console.debug('SOGoAccountsManager.RestDataSource.fetch(): baseUrl="%s"', baseUrl);

        if( baseUrl ) {
            SC.Request.getUrl(baseUrl)
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didFetchRecords, store, query)
                .send();
            console.debug('SOGoAccountsManager.RestDataSource.fetch(): exit(YES)');
            return YES;
        }

        console.error('SOGoAccountsManager.RestDataSource.fetch(): exit(NO)');
        return NO; // return YES if you handled the query
    },

    didFetchRecords: function(response, store, query)
    {
        console.debug('SOGoAccountsManager.RestDataSource.didFetchRecords(): enter');
        console.debug('SOGoAccountsManager.RestDataSource.didFetchRecords(): url="%s"', response.get('address'));

        if( SC.ok(response) ) {
            console.debug('SOGoAccountsManager.RestDataSource.didFetchRecords(): request succeeded');
            var dataHash = response.get('body');
            store.loadRecords(query.get('recordType'), dataHash);
            store.dataSourceDidFetchQuery(query);
 
        } else {
            console.warn('SOGoAccountsManager.RestDataSource.didFetchRecords(): request failed');
            store.dataSourceDidErrorQuery(query, response);
        }
        console.debug('SOGoAccountsManager.RestDataSource.didFetchRecords(): exit');
    },

    // ..........................................................
    // RECORD SUPPORT
    // 
  
    retrieveRecord: function(store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.retrieveRecord(): enter');

        var baseUrl = this._baseUrlFor(store, storeKey);
        console.debug('SOGoAccountsManager.RestDataSource.retrieveRecord(): baseUrl="%s"', baseUrl);

        if( baseUrl ) {
            SC.Request.getUrl( baseUrl + '/' + store.idFor(storeKey) )
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didRetrieveRecord, store, storeKey)
                .send();
            console.debug('SOGoAccountsManager.RestDataSource.retrieveRecord(): exit(YES)');
            return YES;
         }

        console.error('SOGoAccountsManager.RestDataSource.retrieveRecord(): exit(NO)');
        return NO; // return YES if you handled the storeKey
    },

    didRetrieveRecord: function(response, store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.didRetrieveRecord(): enter');
        console.debug('SOGoAccountsManager.RestDataSource.didRetrieveRecord(): url="%s"', response.get('address'));

        if( SC.ok(response) ) {
            console.debug('SOGoAccountsManager.RestDataSource.didRetrieveRecord(): request succeeded');
            var dataHash = response.get('body');
            store.dataSourceDidComplete(storeKey, dataHash);
 
        } else {
            console.warn('SOGoAccountsManager.RestDataSource.didRetrieveRecord(): request failed');
            store.dataSourceDidError(storeKey, response);
        }
        console.debug('SOGoAccountsManager.RestDataSource.didRetrieveRecord(): exit');
    }, 

    createRecord: function(store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.createRecord(): enter');

        var baseUrl = this._baseUrlFor(store, storeKey);
        console.debug('SOGoAccountsManager.RestDataSource.createRecord(): baseUrl="%s"', baseUrl);

        if( baseUrl ) {
            SC.Request.postUrl(baseUrl)
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didCreateRecord, store, storeKey)
                .send(store.readDataHash(storeKey));
            console.debug('SOGoAccountsManager.RestDataSource.createRecord(): exit(YES)');
            return YES;
        }    

        console.error('SOGoAccountsManager.RestDataSource.createRecord(): exit(NO)');
        return NO; // return YES if you handled the storeKey
    },

    didCreateRecord: function(response, store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.didCreateRecord(): enter');
        console.debug('SOGoAccountsManager.RestDataSource.didCreateRecord(): url="%s"', response.get('address'));

        if( SC.ok(response) ) {
            console.debug('SOGoAccountsManager.RestDataSource.didCreateRecord(): request succeeded');
            var dataHash = response.get('body');
            var type = store.recordTypeFor(storeKey);
            store.dataSourceDidComplete(storeKey, dataHash, dataHash[type.prototype.primaryKey]); // update id

        } else {
            console.warn('SOGoAccountsManager.RestDataSource.didCreateRecord(): request failed');
            store.dataSourceDidError(storeKey, response);
        }
        console.debug('SOGoAccountsManager.RestDataSource.didCreateRecord(): exit');
    },
  
    updateRecord: function(store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.updateRecord(): enter');

        var baseUrl = this._baseUrlFor(store, storeKey);
        console.debug('SOGoAccountsManager.RestDataSource.updateRecord(): baseUrl="%s"', baseUrl);

        if( baseUrl ) {
            SC.Request.putUrl( baseUrl + '/' + store.idFor(storeKey) )
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didUpdateRecord, store, storeKey)
                .send(store.readDataHash(storeKey));
            console.debug('SOGoAccountsManager.RestDataSource.updateRecord(): exit(YES)');
            return YES;
        }

        console.error('SOGoAccountsManager.RestDataSource.updateRecord(): exit(NO)');
        return NO; // return YES if you handled the storeKey
    },
  
    didUpdateRecord: function(response, store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.didUpdateRecord(): enter');
        console.debug('SOGoAccountsManager.RestDataSource.didUpdateRecord(): url="%s"', response.get('address'));

        if( SC.ok(response) ) {
            console.debug('SOGoAccountsManager.RestDataSource.didUpdateRecord(): request succeeded');
            var dataHash = response.get('body');
            store.dataSourceDidComplete(storeKey, dataHash);

        } else {
            console.warn('SOGoAccountsManager.RestDataSource.didUpdateRecord(): request failed');
            store.dataSourceDidError(storeKey, response);
        }
        console.debug('SOGoAccountsManager.RestDataSource.didUpdateRecord(): exit');
    },

    destroyRecord: function(store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.destroyRecord(): enter');

        var baseUrl = this._baseUrlFor(store, storeKey);
        console.debug('SOGoAccountsManager.RestDataSource.destroyRecord(): baseUrl="%s"', baseUrl);

        if( baseUrl ) {
            SC.Request.deleteUrl( baseUrl + '/' + store.idFor(storeKey) )
                .header({'Accept': 'application/json'})
                .json()
                .notify(this, this.didDestroyRecord, store, storeKey)
                .send();
            console.debug('SOGoAccountsManager.RestDataSource.destroyRecord(): exit(YES)');
            return YES;
        }    

        console.error('SOGoAccountsManager.RestDataSource.destroyRecord(): exit(NO)');
        return NO; // return YES if you handled the storeKey
    },

    didDestroyRecord: function(response, store, storeKey)
    {
        console.debug('SOGoAccountsManager.RestDataSource.didDestroyRecord(): enter');
        console.debug('SOGoAccountsManager.RestDataSource.didDestroyRecord(): url="%s"', response.get('address'));

        if( SC.ok(response) ) {
            console.debug('SOGoAccountsManager.RestDataSource.didDestroyRecord(): request succeeded');
            store.dataSourceDidDestroy(storeKey);
        } else {
            console.warn('SOGoAccountsManager.RestDataSource.didDestroyRecord(): request failed');
            store.dataSourceDidError(storeKey, response);
        }
        console.debug('SOGoAccountsManager.RestDataSource.didDestroyRecord(): exit');
    },

    /**
     * Return the base URL of the REST API for the record(s) concerned
     * by the request.
     */
    _baseUrlFor: function(store, storeKey_or_query)
    {
        var type = null;

        // Get the type of record(s) concerned        
        if( typeof(storeKey_or_query) == 'number' ) {
            // storeKey
            type = store.recordTypeFor(storeKey_or_query);

        } else if( SC.kindOf(storeKey_or_query, SC.Query) ) {
            // Query
            type = storeKey_or_query.get('recordType');
        }

        // Get the URL, depending of the type
        return ( type && type.BASE_URL ) 
            ? type.BASE_URL
            : null;
    }
});

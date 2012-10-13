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

SOGoAccountsManager.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page
    // load.
    mainPane: SC.MainPane.design({
        defaultResponder: 'SOGoAccountsManager.statechart',
        childViews: 'moduleSwitcher moduleZone'.w(),

        moduleSwitcher: SC.ToolbarView.design(SC.FlowedLayout, {
            layout: { top: 0, left: 0, right: 0, height: 30 },
            classNames: ['modulebar'],

            childViews: 'organizationsButton domainsButton accountsButton distributionGroupsButton resourcesButton exitButton'.w(),
            layoutDirection: SC.LAYOUT_HORIZONTAL,
            align: SC.ALIGN_LEFT,
            defaultFlowSpacing: { top: 0, bottom: 0, left: 0, right: 0 },

            organizationsButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Organizations".loc(),
                action: 'switchToOrganizationsApplication',
            }),

            domainsButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Domains".loc(),
                action: 'switchToDomainsApplication',
            }),

            accountsButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Accounts".loc(),
                action: 'switchToAccountsApplication',
            }),

            distributionGroupsButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Distribution Groups".loc(),
                action: 'switchToDistributionGroupsApplication',
            }),

            resourcesButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Resources".loc(),
                action: 'switchToResourcesApplication',
            }),

            exitButton: SC.ButtonView.design(SC.AutoResize, {
                title: "Back to SOGo".loc(),
                action: 'exitToSOGo',
                classNames: ['exitButton'],
            }),
        }),

        moduleZone: SC.ContainerView.design({
            layout: { top: 31, bottom: 0, left: 0, right: 0 },
            /*nowShowingBinding: 'SOGoAccountsManager.applicationController.moduleShowing',*/
        }),

    })

});

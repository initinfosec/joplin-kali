"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const { connect } = require('react-redux');
const { _ } = require('lib/locale.js');
const { themeStyle } = require('../theme.js');
const { bridge } = require('electron').remote.require('./bridge');
const { Header } = require('./Header.min.js');
const prettyBytes = require('pretty-bytes');
const Resource = require('lib/models/Resource.js');
const ResourceTable = (props) => {
    const sortOrderEngagedMarker = (s) => {
        return (React.createElement("a", { href: "#", onClick: () => props.onToggleSorting(s) }, (props.sorting.order === s && props.sorting.type === 'desc') ? '▾' : '▴'));
    };
    return React.createElement("table", { style: { width: '90%' } },
        React.createElement("thead", null,
            React.createElement("tr", null,
                React.createElement("th", null,
                    _('Title'),
                    " ",
                    sortOrderEngagedMarker('name')),
                React.createElement("th", null,
                    _('Size'),
                    " ",
                    sortOrderEngagedMarker('size')),
                React.createElement("th", null, _('ID')),
                React.createElement("th", null, _('Action')))),
        React.createElement("tbody", null, props.resources.map((resource, index) => React.createElement("tr", { key: index },
            React.createElement("td", null,
                React.createElement("a", { href: "#", onClick: () => props.onResourceClick(resource) }, resource.title)),
            React.createElement("td", null, prettyBytes(resource.size)),
            React.createElement("td", null, resource.id),
            React.createElement("td", null,
                React.createElement("button", { onClick: () => props.onResourceDelete(resource) }, _('Delete')))))));
};
const getSortingOrderColumn = (s) => {
    switch (s) {
        case 'name': return 'title';
        case 'size': return 'size';
    }
};
const getNextSortingOrderType = (s) => {
    if (s === 'asc') {
        return 'desc';
    }
    else {
        return 'asc';
    }
};
const MAX_RESOURCES = 10000;
class ResourceScreenComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: undefined,
            sorting: {
                type: 'asc',
                order: 'name',
            },
            isLoading: false,
        };
    }
    reloadResources(sorting) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setState({ isLoading: true });
            const resources = yield Resource.all({
                order: [{
                        by: getSortingOrderColumn(sorting.order),
                        dir: sorting.type,
                    }],
                limit: MAX_RESOURCES,
                fields: ['title', 'id', 'size', 'file_extension'],
            });
            this.setState({ resources, isLoading: false });
        });
    }
    componentDidMount() {
        this.reloadResources(this.state.sorting);
    }
    onResourceDelete(resource) {
        Resource.delete(resource.id)
            .catch((error) => {
            bridge().showErrorMessageBox(error.message);
        })
            .finally(() => {
            this.reloadResources(this.state.sorting);
        });
    }
    openResource(resource) {
        const resourcePath = Resource.fullPath(resource);
        const ok = bridge().openExternal(`file://${resourcePath}`);
        if (!ok) {
            bridge().showErrorMessageBox(`This file could not be opened: ${resourcePath}`);
        }
    }
    onToggleSortOrder(sortOrder) {
        let newSorting = Object.assign({}, this.state.sorting);
        if (sortOrder === this.state.sorting.order) {
            newSorting.type = getNextSortingOrderType(newSorting.type);
        }
        else {
            newSorting = {
                order: sortOrder,
                type: 'desc',
            };
        }
        this.setState({ sorting: newSorting });
        this.reloadResources(newSorting);
    }
    render() {
        const style = this.props.style;
        const theme = themeStyle(this.props.theme);
        const headerStyle = Object.assign({}, theme.headerStyle, { width: style.width });
        return React.createElement("div", null,
            React.createElement(Header, { style: headerStyle }),
            React.createElement("div", { style: Object.assign(Object.assign({}, style), { margin: '20px', overflow: 'scroll' }) },
                this.state.isLoading && React.createElement("div", null, _('Please wait...')),
                !this.state.isLoading && React.createElement("div", null,
                    !this.state.resources && React.createElement("div", null, _('No resources!')),
                    this.state.resources && this.state.resources.length === MAX_RESOURCES &&
                        React.createElement("div", null, _('Warning: not all resources shown for performance reasons (limit: %s).', MAX_RESOURCES)),
                    this.state.resources && React.createElement(ResourceTable, { resources: this.state.resources, sorting: this.state.sorting, onToggleSorting: (order) => this.onToggleSortOrder(order), onResourceClick: (resource) => this.openResource(resource), onResourceDelete: (resource) => this.onResourceDelete(resource) }))));
    }
}
const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});
const ResourceScreen = connect(mapStateToProps)(ResourceScreenComponent);
module.exports = { ResourceScreen };

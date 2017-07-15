import React from 'react';

import grid from 'styles/slick-grid/grid.css';

const COLUMN_KEYS = ['A', 'B', 'C', 'D', 'E'];
const ROW_KEYS = [1, 2, 3, 4, 5];

const COLUMNS = COLUMN_KEYS.map((columnKey, index) => (
  { name: `Column ${columnKey}`, id: 1001 + index, key: columnKey, width: 100 }
));

const ROWS = ROW_KEYS.map(id => (
  {
    id: 2000 + id,
    data: COLUMNS.reduce((map, column) => (
      { ...map, [column.id]: `${column.key}${id}` }
    ), {})
  }
));

const COLUMN_MAP = COLUMNS.reduce((map, column) => ({ ...map, [column.id]: column }), {});
const ROW_MAP = ROWS.reduce((map, row) => ({ ...map, [row.id]: row }), {});

class ColumnHeader extends React.Component {
  render () {
    return (
      <div className="slick-header-column ui-state-default" data-column={ this.props.columnId }>
        <span className="slick-column-name">{ this.props.name }</span>
      </div>
    );
  }
}

class RowCell extends React.Component {
  render () {
    const classes = ['slick-cell'];
    classes.push(`l${this.props.columnIndex}`); // left index
    classes.push(`r${this.props.columnIndex}`); // right index (only matters for spanning columns)

    return (
      <div className={ classes.join(' ') }>
        <div>{ this.props.text }</div>
      </div>
    );
  }
}

class Row extends React.Component {
  render () {
    const classes = ['ui-widget-content', 'slick-row'];
    classes.push(this.props.rowIndex % 1 === 0 ? 'even' : 'odd');

    const columns = COLUMNS;
    const rowData = this.props.row.data;

    return (
      <div className={ classes.join(' ') } data-column={ this.props.rowId }>
        {
          columns.map((column, index) => (
            <RowCell key={ index } columnIndex={ index } text={ rowData[column.id] } />
          ))
        }
        <span className="slick-column-name">{ this.props.name }</span>
      </div>
    );
  }
}

function buildColumnCssRule (column, left = 0) {
  return {
    left: `${left}px`,
    right: `${left + column.width}px`,
    width: `${column.width}px`
  };
}

function buildColumnsCssRules (columns = COLUMNS) {
  const ruleMap = {};
  let left = 0;
  columns.forEach((column) => {
    ruleMap[column.id] = buildColumnCssRule(column, left);
    left += column.width;
  });
  return ruleMap;
}

class Stylesheet extends React.Component {
  state = {
    rules: {
      columns: buildColumnsCssRules()
    }
  };

  constructor (props) {
    super(props);

    this.setColumnWidth = this.setColumnWidth.bind(this);
  }

  setColumnWidth (columnIndex, width) {
    COLUMNS[columnIndex].width = width;

    this.setState({
      rules: {
        ...this.state.rules,
        columns: buildColumnsCssRules()
      }
    });
  }

  render () {
    const rules = COLUMNS.map((column, columnIndex) => {
      const columnRules = this.state.rules.columns[column.id];
      return `
        .l${columnIndex} {
          left: ${columnRules.left};
          width: ${columnRules.width};
        }
      `;
    });

    return (
      <style type="text/css" ref="stylesheet">{ rules.join(' ') }</style>
    );
  }
}

class Grid extends React.Component {
  render () {
    return (
      <div className="container">
        <Stylesheet ref={(ref) => { this.styles = ref }} />

        <div className="slick-header ui-state-default">
          <div className="slick-header-columns">
            {
              COLUMNS.map(column => (
                <ColumnHeader key={ column.id } name={ column.name } columnId={ column.id } />
              ))
            }
          </div>
        </div>

        <div className="slick-headerrow ui-state-default">
          <div className="slick-headerrow-columns" />
          <div style={{ display: 'block', height: '1px', display: 'hidden' }} />
        </div>

        <div
          className="slick-top-panel-scroller ui-state-default"
          style={{ overflow: 'hidden', position: 'relative', display: 'hidden' }} />

        <div
          className="slick-viewport"
          style={{ width: '100%', overflow: 'auto', outline: '0', position: 'relative', overflowY: 'auto' }}
        >
          <div className="grid-canvas">
            {
              ROWS.map((row, index) => (
                <Row key={ index } row={ row } rowIndex={ index } />
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Grid;

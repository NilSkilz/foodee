import React, { Component } from 'react';

class RowStock extends Component {
  render() {
    const { status } = this.props;
    let color = '#52c41a';
    if (status === 'warning') color = '#faad14';
    if (status === 'error') color = '#f5222d';

    return <div style={{ backgroundColor: color, height: '65px', width: '5px', margin: '0', padding: '0' }}></div>;
  }
}

export default RowStock;

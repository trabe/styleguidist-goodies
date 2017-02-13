import React, { PropTypes } from "react";

const AnotherTestComponent = ({ b }) => <div>{b}</div>;

AnotherTestComponent.propTypes = {
  /**
   * Just an "b"
   */
  b: PropTypes.String,
};

export default AnotherTestComponent;

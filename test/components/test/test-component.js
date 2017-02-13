import React, { PropTypes } from "react";

const TestComponent = ({ a }) => <div>{a}</div>;

TestComponent.propTypes = {
  /**
   * Just an "a"
   */
  a: PropTypes.String,
};

export default TestComponent;

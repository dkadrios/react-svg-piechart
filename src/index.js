import React from "react"
import PropTypes from "prop-types"
import btoa from "btoa"

import Circle from "./Circle"
import Sectors from "./Sectors"
import Sector from "./Sector"

class PieChart extends React.Component {
  state = {
    expandedIndex: null,
  }

  getLinkHref = (data, pattern) =>
    "data:image/svg+xml;base64," +
    btoa(` \
    <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'> \
      <rect width='10' height='10' fill='${data.color}'/> \
      ${pattern} \
    </svg>`)

  getPattern = (idx, patterns) =>
    patterns && patterns.length ? patterns[idx] || {id: idx} : {id: idx}

  transformData = (data, patterns, usePatterns) =>
    data.map((d, idx) => ({
      ...d,
      patternId: usePatterns ? this.getPattern(idx, patterns).id : "",
      patternHref: usePatterns
        ? this.getLinkHref(d, this.getPattern(idx, patterns).pattern)
        : "",
      color: usePatterns
        ? `url(#${this.getPattern(idx, patterns).id})`
        : d.color,
    }))

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.expandedIndex >= 0) {
      return {
        expandedIndex: nextProps.expandedIndex,
      }
    } else {
      return null
    }
  }

  handleSectorHover = (data, index, e) => {
    const {expandOnHover, onSectorHover} = this.props

    if (expandOnHover) {
      this.setState({expandedIndex: index})
    }

    if (onSectorHover) {
      onSectorHover(data, index, e)
    }
  }

  renderSingleData(d, center) {
    const {expandedIndex} = this.state
    const {expandOnHover, expandSize} = this.props
    return (
      <Circle
        center={center}
        radius={
          center +
          (d.expanded || (expandOnHover && expandedIndex === 0)
            ? expandSize
            : 0)
        }
        onMouseEnter={e => this.handleSectorHover(d, 0, e)}
        onMouseLeave={e => this.handleSectorHover(null, null, e)}
        onTouchEnd={e => this.handleSectorHover(null, null, e)}
        onTouchStart={e => this.handleSectorHover(d, 0, e)}
        {...d}
      />
    )
  }

  renderMultipleData(center) {
    const {expandedIndex} = this.state
    const {data, expandOnHover, usePatterns, ...props} = this.props
    const patterns = data.map(d => d.pattern)
    const newData = this.transformData(data, patterns, usePatterns)

    return (
      <Sectors
        center={center}
        data={
          expandOnHover
            ? newData.map((d, i) => ({
                ...d,
                expanded: i === expandedIndex,
              }))
            : newData
        }
        {...props}
        onSectorHover={this.handleSectorHover}
      />
    )
  }

  shouldExpand = () => {
    const {data, expandOnHover} = this.props
    const oneDataIsExpanded = data.some(d => d.expanded)
    return oneDataIsExpanded || expandOnHover
  }

  render() {
    const {data, expandSize, viewBoxSize, usePatterns} = this.props
    const center = viewBoxSize / 2
    const offset = this.shouldExpand() ? expandSize : 0
    const patterns = data.map(d => d.pattern)

    const newData = this.transformData(data, patterns, usePatterns)

    const dataWithValue = newData.filter(d => d.value > 0)

    return dataWithValue && dataWithValue.length > 0 ? (
      <svg
        viewBox={`0 0 ${viewBoxSize + offset * 2} ${viewBoxSize + offset * 2}`}
      >
        {usePatterns && (
          <defs>
            {newData.map(d => (
              <pattern
                key={d.patternId}
                id={d.patternId}
                patternUnits="userSpaceOnUse"
                width="5"
                height="5"
              >
                <image
                  xlinkHref={d.patternHref}
                  x="0"
                  y="0"
                  width="5"
                  height="5"
                />
              </pattern>
            ))}
          </defs>
        )}
        <g transform={`translate(${offset}, ${offset})`}>
          {dataWithValue.length === 1
            ? this.renderSingleData(dataWithValue[0], center)
            : this.renderMultipleData(center)}
        </g>
      </svg>
    ) : null
  }
}

PieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      pattern: PropTypes.object,
      title: PropTypes.string,
      value: PropTypes.number.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
  expandOnHover: PropTypes.bool,
  expandSize: PropTypes.number,
  expandedIndex: PropTypes.number,
  onSectorHover: PropTypes.func,
  strokeColor: Sector.propTypes.strokeColor,
  strokeLinejoin: Sector.propTypes.strokeLinejoin,
  strokeWidth: Sector.propTypes.strokeWidth,
  startAngle: PropTypes.number,
  angleMargin: PropTypes.number,
  viewBoxSize: PropTypes.number,
  transitionDuration: Sector.propTypes.transitionDuration,
  transitionTimingFunction: Sector.propTypes.transitionTimingFunction,
  usePatterns: PropTypes.bool,
}

PieChart.defaultProps = {
  data: [],
  expandOnHover: false,
  expandSize: Sectors.defaultProps.expandSize,
  expandedIndex: -1,
  onSectorHover: null,
  shrinkOnTouchEnd: false,
  strokeColor: Sector.defaultProps.strokeColor,
  strokeLinejoin: Sector.defaultProps.strokeLinejoin,
  strokeWidth: Sector.defaultProps.strokeWidth,
  startAngle: 0,
  angleMargin: 0,
  viewBoxSize: 100,
  transitionDuration: Sector.defaultProps.transitionDuration,
  transitionTimingFunction: Sector.defaultProps.transitionTimingFunction,
  usePatterns: false,
}

export default PieChart

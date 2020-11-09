import React from "react"
import { Link } from "gatsby"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

const List = styled.div`
  display: inline-block;
  font-size: .875em;
  margin: 10px 0 10px 0;
`

const TagsLink = styled(Link)`
  border: 0.1em solid;
  margin: 0 10px 0 0;
  border-radius: 4px;
  padding: 3px 7px;
  text-decoration: none;
`

const TagsLayout = ({ tags }) => (
  <div>
    {tags.map((tag, index) => (
      <List key={index}>
        <TagsLink to={`/tags/${tag}`}>
          {tag}
        </TagsLink>
      </List>
    ))}
  </div>
)

TagsLayout.defaultProps = {
  tags: [],
}

TagsLayout.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
}

export default TagsLayout

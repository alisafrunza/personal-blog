import React from "react"
import { Link, graphql } from "gatsby"
import PropTypes from "prop-types"
import kebabCase from "lodash/kebabCase"
import styled from "@emotion/styled"

import Layout from "../components/layout"
import SEO from "../components/seo"

const MarkedHeader = styled.h1`
  display: inline;
  border-radius: 1em 0 1em 0;
  background-image: linear-gradient(
    -100deg,
    rgba(255, 250, 150, 0.15),
    rgba(255, 250, 150, 0.8) 100%,
    rgba(255, 250, 150, 0.25)
  );
`

const TagsList = styled.ul`
  padding-top: 30px;
  margin-left: 0;
`

const List = styled.li`
  display: inline-block;
  list-style: none;
  float: left;
  font-size: .875em;
  line-height: 3em;
  padding: 0 10px 0 0;
`

const TagsLink = styled(Link)`
  border: 0.1em solid;
  margin: 2px;
  border-radius: 4px;
  padding: 3px 7px;
  text-decoration: none;
`

const TagsPage = ({
  data: {
    allMarkdownRemark: { group },
    site: {
      siteMetadata: { title },
    },
  },
}) => (
  <Layout>
    <SEO title="All Tags" />

    <MarkedHeader>All Tags</MarkedHeader>

    <TagsList>
      {group.map(tag => (
        <List key={tag.fieldValue}>
          <TagsLink to={`/tags/${kebabCase(tag.fieldValue)}/`}>
            {tag.fieldValue} ({tag.totalCount})
          </TagsLink>
        </List>
      ))}
    </TagsList>
  </Layout>
)

TagsPage.propTypes = {
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      group: PropTypes.arrayOf(
        PropTypes.shape({
          fieldValue: PropTypes.string.isRequired,
          totalCount: PropTypes.number.isRequired,
        }).isRequired
      ),
    }),
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }),
    }),
  }),
}

export default TagsPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`

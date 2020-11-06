import React from "react"
import PropTypes from "prop-types"
import { Link, graphql } from "gatsby"
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

const Content = styled.div`
  margin: 0 auto;
  max-width: 860px;
  padding: 1.45rem 1.0875rem;
`

const TagsLink = styled(Link)`
  color: black;
  margin: 30px 0 0 0;
  text-decoration: none;
  display: inline-block;
  position: relative;
`

const TitleLink = styled(TagsLink)`
  font-size: 1.3rem;
`

const MenuLink = styled(TagsLink)`
  ::after {
    content: "";
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.8);
    transform-origin: bottom right;
    transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
  }

  :hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`

const List = styled.ul`
  margin-left: 0;
`

const TagsList = styled.li`
  list-style-type: none;
  margin-bottom: 0;
`

const ArticleDate = styled.h5`
  display: inline;
  color: #606060;
`
const ReadingTime = styled.h5`
  display: inline;
  color: #606060;
`

const Tags = ({ pageContext, data }) => {
  const { tag } = pageContext
  const { edges, totalCount } = data.allMarkdownRemark
  const seoTitle = `${tag.charAt(0).toUpperCase() + tag.slice(1)}`
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : "s"
  } tagged with "${tag}"`

  return (
    <Layout>
      <SEO title={`${seoTitle} Posts`} />

      <Content>
        <MarkedHeader>{tagHeader}</MarkedHeader>
        <List>
          {edges.map(({ node }) => {
            const { slug, readingTime } = node.fields
            const { title, date, path } = node.frontmatter
            return (
              <TagsList key={slug}>
                <TitleLink to={path}>{title}</TitleLink>
                <div>
                  <ArticleDate>{date}</ArticleDate>
                  <ReadingTime> - {readingTime.text}</ReadingTime>
                </div>
              </TagsList>
            )
          })}
        </List>

        <MenuLink to="/tags">All tags</MenuLink>
      </Content>
    </Layout>
  )
}

Tags.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
            }),
            fields: PropTypes.shape({
              slug: PropTypes.string.isRequired,
            }),
          }),
        }).isRequired
      ),
    }),
  }),
}

export default Tags

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
            readingTime {
              text
            }
          }
          frontmatter {
            date(formatString: "DD MMMM, YYYY")
            title
            path
          }
        }
      }
    }
  }
`

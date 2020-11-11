import React from "react"
import styled from "@emotion/styled"

import Layout from "../components/layout"
import SEO from "../components/seo"

const Content = styled.div`
  margin: 0 auto;
  max-width: 860px;
  padding: 1.45rem 1.0875rem;
  a {
    text-decoration: none;
    position: relative;

    background-image: linear-gradient(
      rgba(255, 250, 150, 0.8),
      rgba(255, 250, 150, 0.8)
    );
    background-repeat: no-repeat;
    background-size: 100% 0.2em;
    background-position: 0 88%;
    transition: background-size 0.25s ease-in;
    &:hover {
      background-size: 100% 88%;
    }
  }

  a > code:hover {
    text-decoration: underline;
  }
`

const HeaderDate = styled.h4`
  margin-top: 10px;
  color: #606060;
  padding-bottom: 20px;
`

const NowPage = ({ data }) => {
  return (
    <Layout>
      <SEO title="Now" />

      <Content>
        <h1>What I’m doing now</h1>
        <HeaderDate>
          Last updated on November 11, 2020
        </HeaderDate>

        <ul>
          <li>Living in the beautiful North Holland.</li>
          <li>Working at YoungCapital as a Ruby on Rails developer.</li>
          <li>Gave up eating meat.</li>
          <li>Trying to eat vegan most of the time, which gives me the coolest possibility to discover new recipes and dishes I didn't even know about before.</li>
          <li>Doing a <a href="https://youtu.be/NeEMs38YaBY">30-day morning yoga challenge</a>. Won't lie, some days I skip. But now I am on day 14.</li>
          <li>Poking around Adobe Illustrator a bit. I am mesmerized by all the artwork you can create there.</li>
        </ul>

        <p style={{paddingTop: `20px`}}>
          This page is inspired by <a href="http://ana-balica.github.io/now">Ana Balica's Now Page</a>, which in its turn was inspired by <a href="https://nownownow.com/about">Derek Sivers's Now Page Movement</a>.
        </p>
      </Content>
    </Layout>
  )
}

export default NowPage

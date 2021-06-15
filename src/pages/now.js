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
      rgba(175, 238, 238, 0.8),
      rgba(175, 238, 238, 0.8)
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
          Last updated on June 15, 2021
        </HeaderDate>

        <ul>
          <li>Living in the beautiful North Holland.</li>
          <li>Working at YoungCapital as a Ruby on Rails developer.</li>
          <li>Gave up eating meat.</li>
          <li>Trying to eat vegan most of the time, which gives me the coolest possibility to discover new recipes and dishes I didn't even know about before.</li>
          <li>Enjoying yoga at home with <a href="https://www.downdogapp.com/">Down Dog</a>.</li>
          <li>Learning how to draw in Adobe Fresco. It is amazing how so many art tools and techniques are brought into one app.</li>
        </ul>

        <p style={{paddingTop: `20px`}}>
          This page is inspired by <a href="http://ana-balica.github.io/now">Ana Balica's Now Page</a>, which in its turn was inspired by <a href="https://nownownow.com/about">Derek Sivers's Now Page Movement</a>.
        </p>
      </Content>
    </Layout>
  )
}

export default NowPage

import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Capabilities } from './sections/Capabilities'
import { Work } from './sections/Work'
import { Path } from './sections/Path'
import { Contact } from './sections/Contact'
import { person } from './data/content'

export default function App() {
  return (
    <main className="content" id="content">
      <Hero />
      <About />
      <Capabilities />
      <Work />
      <Path />
      <Contact />

      <footer className="footer">
        <span>
          © {new Date().getFullYear()} {person.name}
        </span>
        <span>Built with React · Three.js · GLSL</span>
        <span>{person.location}</span>
      </footer>
    </main>
  )
}
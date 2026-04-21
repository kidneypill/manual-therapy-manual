import Hero from '@/components/landing/Hero'
import StatBar from '@/components/landing/StatBar'
import FeatureGrid from '@/components/landing/FeatureGrid'
import WorkflowSteps from '@/components/landing/WorkflowSteps'
import StructureSection from '@/components/landing/StructureSection'
import CtaBand from '@/components/landing/CtaBand'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatBar />
      <FeatureGrid />
      <WorkflowSteps />
      <StructureSection />
      <CtaBand />
    </>
  )
}

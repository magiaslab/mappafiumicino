import { DashboardComponent } from '../components/dashboard'
import { GoogleSheetFetcherComponent } from '@/components/google-sheet-fetcher'

export default function Page() {
  return (
    <>
      <DashboardComponent />
      <GoogleSheetFetcherComponent />
    </>
  )
}
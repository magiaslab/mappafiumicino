"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Importa il tipo IconDefault
import { Icon as LeafletIcon } from 'leaflet';

// Estendi il tipo IconDefault
interface ExtendedIconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

// Usa il tipo esteso
delete (L.Icon.Default.prototype as ExtendedIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// Function to parse CSV string into an array of objects
const parseCSV = (csv: string) => {
  const lines = csv.split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim()
      return obj
    }, {} as Record<string, string>)
  })
}

interface LocationData {
  id: string
  numero: string
  lat: number
  long: number
  profondita: number
  tipologia: string
}

export function DashboardComponent() {
  const [data, setData] = useState<LocationData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this URL with your Google Sheet's published CSV URL
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS0W4j01qgeA0BlgW4f6PAoJzXBZLVw3DGONHeWnzTO2SdtysSM38I5alXnmATvYdzu13MnMQ-A0WH1/pub?gid=0&single=true&output=csv')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const csvText = await response.text()
        const parsedData = parseCSV(csvText)
        const formattedData: LocationData[] = parsedData
          .map((item, index) => ({
            id: index.toString(),
            numero: item.numero,
            lat: parseFloat(item.lat),
            long: parseFloat(item.long),
            profondita: parseInt(item.prof),
            tipologia: item.tipologia.toString()
          }))
          .filter(item => !isNaN(item.lat) && !isNaN(item.long)); // Filtra i dati non validi
        setData(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = data.filter((item) =>
    item.numero.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Impianto Mitilicoltura Fiumicino</h1>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Mappa Impianto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-md overflow-hidden">
              <MapContainer 
                center={[41.8755, 12.1447]} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {data.map((item) => (
                  <Marker key={item.id} position={[item.lat, item.long]}>
                    <Popup>
                      <b>{item.numero}</b><br />
                      Numero: ${item.numero.toLocaleString()}<br />
                      Latitudine: ${item.lat.toLocaleString()}<br />
                      Longitudine: ${item.long.toLocaleString()}<br />
                      Profondità: ${item.profondita.toLocaleString()}<br />
                      Tipologia: ${item.tipologia.toLocaleString()}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Dati Impianto</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Profondità</TableHead>
                  <TableHead>Latitudine</TableHead>
                  <TableHead>Longitudine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.numero}</TableCell>
                    <TableCell>{item.tipologia}</TableCell>
                    <TableCell>{item.profondita}</TableCell>
                    <TableCell>{item.lat}</TableCell>
                    <TableCell>{item.long}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function GoogleSheetFetcherComponent() {
  const [data, setData] = useState<Record<string, string>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Replace this URL with your Google Sheet's published CSV URL
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS0W4j01qgeA0BlgW4f6PAoJzXBZLVw3DGONHeWnzTO2SdtysSM38I5alXnmATvYdzu13MnMQ-A0WH1/pub?gid=0&single=true&output=csv')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const csvText = await response.text()
      const parsedData = parseCSV(csvText)
      setData(parsedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Punti principali</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading data...</p>
        ) : error ? (
          <div>
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={fetchData} className="mt-2">Retry</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(data[0] || {}).map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, cellIndex) => (
                    <TableCell key={cellIndex}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
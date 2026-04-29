import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'

const SummaryCard = ({ title, value, subtitle }) => {
  return (
    <div className='bg-white rounded-lg border p-4 shadow-sm'>
      <p className='text-sm text-slate-500'>{title}</p>
      <p className='text-3xl font-semibold mt-2'>{value}</p>
      {subtitle && <p className='text-xs text-slate-400 mt-2'>{subtitle}</p>}
    </div>
  )
}

const SalesReport = () => {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getSalesReport
      })

      if (response?.data?.success) {
        setReport(response.data.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  if (loading) {
    return <Loading />
  }

  const renderSection = (label, data) => (
    <div className='bg-slate-50 rounded-lg p-4 border'>
      <h3 className='font-semibold mb-3'>{label}</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <SummaryCard title='Total Revenue' value={DisplayPriceInRupees(data.totalRevenue)} />
        <SummaryCard title='Gross Profit' value={DisplayPriceInRupees(data.grossProfit)} subtitle={`${data.profitMargin}% margin`} />
        <SummaryCard title='Total Cost' value={DisplayPriceInRupees(data.totalCost)} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-4'>
        <SummaryCard title='Total Orders' value={data.totalOrders} />
        <SummaryCard title='Items Sold' value={data.totalItems} />
        <SummaryCard title='Profit Margin' value={`${data.profitMargin}%`} />
      </div>
    </div>
  )

  const renderPeakSalesTime = (info) => {
    if (!info) {
      return null
    }

    return (
      <div className='bg-slate-50 rounded-lg p-4 border'>
        <h3 className='font-semibold mb-3'>Peak Sales Time Insights</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <SummaryCard
            title='Peak Hour'
            value={info.peakHourLabel || 'N/A'}
            subtitle={`${DisplayPriceInRupees(info.peakHourRevenue)} • ${info.peakHourOrders} orders`}
          />
          <SummaryCard
            title='Peak Day'
            value={info.peakDay || 'N/A'}
            subtitle={`${DisplayPriceInRupees(info.peakDayRevenue)} • ${info.peakDayOrders} orders`}
          />
        </div>
      </div>
    )
  }

  const renderDailyChart = (records) => {
    if (!records || records.length === 0) {
      return null
    }

    const maxRevenue = Math.max(...records.map((record) => record.totalRevenue || 0), 1)

    return (
      <div className='bg-white rounded-lg border p-4 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold'>Last 7 Days Revenue Chart</h3>
          <span className='text-sm text-slate-500'>{records.length} days tracked</span>
        </div>
        <div className='grid gap-3 md:grid-cols-7'>
          {records.map((record) => (
            <div key={record.date} className='flex flex-col items-center gap-2'>
              <div className='relative h-48 w-full flex items-end'>
                <div
                  className='w-full rounded-t-lg bg-slate-800 transition-all'
                  style={{
                    height: `${(record.totalRevenue / maxRevenue) * 100}%`
                  }}
                />
              </div>
              <div className='text-center text-xs'>
                <div className='font-semibold'>{DisplayPriceInRupees(record.totalRevenue)}</div>
                <div className='text-slate-500'>{record.date.slice(5)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDailyRecords = (records) => (
    <div className='bg-white rounded-lg border p-4 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold'>Last 7 Days Records</h3>
        <span className='text-sm text-slate-500'>{records.length} days tracked</span>
      </div>
      <div className='overflow-x-auto'>
        <table className='min-w-full border-collapse'>
          <thead>
            <tr className='bg-slate-100'>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Date</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Revenue</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Cost</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Gross Profit</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Orders</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Items</th>
              <th className='px-3 py-2 text-left text-sm font-semibold'>Margin</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.date} className='border-t hover:bg-slate-50'>
                <td className='px-3 py-2 text-sm'>{record.date}</td>
                <td className='px-3 py-2 text-sm'>{DisplayPriceInRupees(record.totalRevenue)}</td>
                <td className='px-3 py-2 text-sm'>{DisplayPriceInRupees(record.totalCost)}</td>
                <td className='px-3 py-2 text-sm'>{DisplayPriceInRupees(record.grossProfit)}</td>
                <td className='px-3 py-2 text-sm'>{record.totalOrders}</td>
                <td className='px-3 py-2 text-sm'>{record.totalItems}</td>
                <td className='px-3 py-2 text-sm'>{record.profitMargin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <section className='p-4'>
      <div className='bg-white p-4 rounded shadow-sm mb-4'>
        <h2 className='text-2xl font-semibold'>Sales Reports</h2>
        <p className='text-sm text-slate-500 mt-1'>Daily, weekly, and monthly revenue plus profit and loss summary.</p>
      </div>

      {report ? (
        <div className='grid gap-4'>
          {renderSection('Daily Sales', report.daily)}
          {renderSection('Weekly Sales', report.weekly)}
          {renderSection('Monthly Sales', report.monthly)}
          {renderPeakSalesTime(report.peakSalesTime)}
          {renderDailyChart(report.dailyRecords || [])}
          {renderDailyRecords(report.dailyRecords || [])}
        </div>
      ) : (
        <div className='text-center text-slate-500'>No sales report available yet.</div>
      )}
    </section>
  )
}

export default SalesReport

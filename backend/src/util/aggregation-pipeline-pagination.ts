/* eslint-disable max-lines-per-function */
import { FilterQuery } from 'mongoose'

export const paginationPipeLine = (page = '1', filter: any, limit = 50, totalsGroup?: any) => {
  const skip = (Number(page) - 1) * limit

  return [
    ...filter,
    // {
    //   $sort: {
    //     createdAt: -1,
    //   },
    // },

    {
      $facet: {
        total: [
          {
            $count: 'count',
          },
        ],
        data: [
          {
            $addFields: {
              _id: '$_id',
            },
          },
        ],
        ...(totalsGroup ? { totals: [{ $group: { _id: null, ...totalsGroup } }] } : {}),
      },
    },
    {
      $unwind: '$total',
    },

    {
      $project: {
        items: {
          $slice: [
            '$data',
            skip,
            {
              $ifNull: [limit, '$total.count'],
            },
          ],
        },
        page: {
          $literal: skip / limit + 1,
        },
        hasNextPage: {
          $lt: [{ $multiply: [limit, Number(page)] }, '$total.count'],
        },
        totalPages: {
          $ceil: {
            $divide: ['$total.count', limit],
          },
        },
        totalItems: '$total.count',
        ...(totalsGroup ? { totals: { $arrayElemAt: ['$totals', 0] } } : {}),
      },
    },
  ]
}

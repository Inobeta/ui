import { TableViewActions } from "../actions"
import * as fromReducer from "./reducer"
import { IbView } from "./table-view"

describe("IbViewReducer", () => {
  describe("add view", () => {
    it("should add", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const { initialState } = fromReducer
      const newState = [view]
      const action = TableViewActions.addView({ view })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
      expect(state).not.toEqual(initialState)
    })
  })

  describe("rename view", () => {
    it("should rename", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const newView = { ...view, name: 'renamed' }
      const initialState = [{ ...view }]
      const newState = [newView]
      const action = TableViewActions.renameView({ id: view.id, name: 'renamed' })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
    })

    it("should return default state if not found", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const initialState = []
      const newState = []
      const action = TableViewActions.renameView({ id: view.id, name: 'renamed' })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
    })
  })

  describe("delete view", () => {
    it("should delete", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const initialState = [{ ...view }]
      const newState = []
      const action = TableViewActions.deleteView({ id: view.id })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
    })
  })

  describe("save view", () => {
    it("should save", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const newView: IbView = {
        ...view,
        data: {
          filter: {},
          pageSize: 5,
          aggregatedColumns: {},
          sort: { active: 'name', direction: 'asc'}
        }
      }
      const initialState = [{ ...view }]
      const newState = [newView]
      const action = TableViewActions.saveView({ id: view.id, data: {
        filter: {},
        pageSize: 5,
        aggregatedColumns: {},
        sort: { active: 'name', direction: 'asc'}
      } })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
    })

    it("should return default state if not found", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const initialState = []
      const newState = []
      const action = TableViewActions.saveView({ id: view.id, data: {
        filter: {},
        pageSize: 5,
        aggregatedColumns: {},
        sort: { active: 'name', direction: 'asc'}
      } })
      const state = fromReducer.viewsReducer(initialState, action)
      expect(state).toEqual(newState)
    })
  })
})

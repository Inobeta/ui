import { TableViewActions } from "../actions"
import * as fromReducer from "./reducer"
import { IbView } from "../views/table-view"

describe("IbPinnedViewReducer", () => {
  describe("pin view", () => {
    it("should pin", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const initialState = []
      const newState = [{ viewId: view.id, groupName: 'test' }]
      const action = TableViewActions.pinView({ id: view.id, groupName: 'test' })
      const state = fromReducer.pinnedViewReducer(initialState, action)
      expect(state).toEqual(newState)
    })

    it("should change pin if already set", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test'
      })
      const nextView = new IbView({
        name: 'Gyoza',
        groupName: 'test'
      })
      const initialState = [{ viewId: view.id, groupName: 'test' }]
      const newState = [{ viewId: nextView.id, groupName: 'test' }]
      const action = TableViewActions.pinView({ id: nextView.id, groupName: 'test' })
      const state = fromReducer.pinnedViewReducer(initialState, action)
      expect(state).toEqual(newState)
    })
  })

  describe("unpin view", () => {
    it("should unpin", () => {
      const view = new IbView({
        name: 'Lorem Dim Sum',
        groupName: 'test',
        data: { test: 123 }
      })
      const initialState = [{ viewId: view.id, groupName: 'test' }]
      const newState = []
      const action = TableViewActions.unpinView({ id: view.id, groupName: 'test' })
      const state = fromReducer.pinnedViewReducer(initialState, action)
      expect(state).toEqual(newState)
    })

  })
})
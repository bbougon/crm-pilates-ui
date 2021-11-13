import {FulFilledAction} from "../../test-utils/features/actionFixtures";
import {LoadingState} from "../../test-utils/features/classroom/classroomStateFixtures";
import reducer, {addClassroom} from "../classroomSlice";
import {classroom} from "../../test-utils/classroom/classroom";
import {add} from "date-fns";

describe('Classroom Slice', () => {

    it('should add classroom', () => {
        // const previousState = new LoadingState().build()
        // let added_classroom = classroom("Cours Duo", 2, new Date(), add(new Date(), {months: 6}), 1, "HOUR", [])
        // const action = new FulFilledAction(addClassroom).withPayload(added_classroom).build()
        //
        // expect(reducer(previousState, action)).toEqual({
        //     classrooms: [added_classroom],
        //     status: "succeeded",
        //     error: null
        // })
    })
})
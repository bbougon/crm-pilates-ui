import * as React from "react";
import {BaseSyntheticEvent, MouseEvent, useState} from "react";
import {Subjects} from "../../features/domain/subjects";
import {FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {Button} from "@material-ui/core";

type AddCreditFormProps = {
    subjects: {subject: Subjects, title: string}[] | []
    onAddCredits: (creditsAmount: number, subject: Subjects) => void
}
export const AddCreditForm = ({onAddCredits, subjects}: AddCreditFormProps)  => {

    const [subject, setSubject] = useState<Subjects | "">("")
    const [creditsAmount, setCreditsAmount] = useState<number>(0)

    const onSubjectChanged = (e: SelectChangeEvent<Subjects | unknown>) => setSubject(e.target.value as Subjects)
    const onCreditsAmountChanged = (e: BaseSyntheticEvent) => setCreditsAmount(e.target.value)
    const onSubmitClicked = (_: MouseEvent) => {
        const value: number = +creditsAmount
        onAddCredits(value, subject as Subjects)
    }

    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px",
            alignItems: "center"
        }}>
            <Grid item xs={2} sx={{
                display: 'flex',
                textAlign: 'left',
                justifyContent: 'flex-start',
            }}>
                <FormControl fullWidth>
                    <InputLabel id="subject-select-label">Subject</InputLabel>
                    <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={subject || ""}
                        required
                        placeholder="Select a subject"
                        label="Subject"
                        variant="standard"
                        onChange={onSubjectChanged}
                        size="small"
                    >
                        {subjects.map(subject => <MenuItem key={subject.subject}
                                                                    value={subject.subject}>{subject.title}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                paddingLeft: '16px',
            }}
            >
                <FormControl>
                    <TextField id="credits-amount"
                               size="small"
                               type="number"
                               label="Amount of credits"
                               required
                               variant="standard"
                               onChange={onCreditsAmountChanged}
                               value={creditsAmount || ""}
                               aria-describedby="credits-amount-help"/>
                </FormControl>
            </Grid>
            <Grid item xs={5} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <Button size="small" onClick={onSubmitClicked}>Add credits</Button>
            </Grid>
        </Grid>
    )
}
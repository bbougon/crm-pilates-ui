import {Client} from "../../features/domain/client";
import * as React from "react";
import {useState} from "react";
import {Subjects} from "../../features/domain/subjects";
import {subjects} from "../../utils/translation";
import {FormControl, Grid, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import {Button} from "@material-ui/core";

type AddCreditFormProps = {
    subjects: {subject: Subjects, title: string}[] | []
    onAddCredits: any
}
export const AddCreditForm = ({onAddCredits, subjects}: AddCreditFormProps)  => {

    const [subject, setSubject] = useState<Subjects | "">("")
    const [creditsAmount, setCreditsAmount] = useState<number | null>(null)

    const onSubjectChanged = (e: any) => setSubject(e.target.value)
    const onCreditsAmountChanged = (e: any) => setCreditsAmount(e.target.value)
    const onSubmitClicked = (e: any) => {
        const value: number = +creditsAmount!
        onAddCredits(value, subject)
    }

    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px",
            alignItems: "center"
        }}>
            <Grid item xs={2} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <FormControl fullWidth>
                    <InputLabel id="subject-select-label">Subject</InputLabel>
                    <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={subject}
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
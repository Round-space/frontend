const determineState = (activeIndex: number, index: number) => {
  if (activeIndex > index) return 'complete'
  return 'incomplete'
}

export const useProgressState = <T extends Record<string, unknown>[]>(steps: T, bountyProgress) => {
//  const [activeStep, setActiveStep] = React.useState(1)
  const activeStep = 
    bountyProgress == 'draft' ? 1 :
    bountyProgress == 'creating' ? 1 :
    bountyProgress == 'created' ? 1 :
    bountyProgress == 'active' ? 2 :
    bountyProgress == 'activating' ? 2 :
    bountyProgress == 'submitting' ? 2 :
    bountyProgress == 'paying' ? 3 : 
    bountyProgress == 'completed' ? 3 : 
    bountyProgress == 'expired' ? 3 :
    bountyProgress == 'draining' ? 3 :
    bountyProgress == 'cancelled' ? 3 : 0;
  const factor = steps.length - 1
  
  return {
    value: (100 / factor) * (activeStep - 1),
//    value: activeStep,
    getState: (index: number) => determineState(activeStep, index)
  }
}
import Container from "@/components/custom/container"

import { useBudgetQuery } from "./queries"
import BudgetHeader from "./components/BudgetHeader"
import BudgetView from "./components/BudgetView"
import ExpenseModals from "./modals"

const Budget = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useBudgetQuery()

  return (
    <>
      <BudgetHeader
        data={data}
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing size="md">
        <BudgetView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <ExpenseModals />
      </Container>
    </>
  )
}

export default Budget
